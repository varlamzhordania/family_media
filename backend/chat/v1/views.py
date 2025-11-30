from datetime import timedelta
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import (
    extend_schema, OpenApiResponse,OpenApiExample
)
from django.db import transaction
from django.conf import settings
from livekit import api

from .serializers import (
    MessageMediaCreateSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    LiveKitTokenRequestSerializer,
    LiveKitTokenResponseSerializer,
    GroupCreateSerializer,
    RoomSerializer, GroupUpdateSerializer, AddParticipantsSerializer,
    RemoveParticipantsSerializer, TransferOwnershipSerializer,
)
from chat.models import Room, IceServer


@extend_schema(tags=["Chat"])
class MessageView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageSerializer

    @extend_schema(
        request=MessageCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=MessageSerializer,
                description="Message created successfully."
            ),
            400: OpenApiResponse(
                description="Validation errors during message or media creation."
            ),
        },
        summary="Send a new chat message",
        description="Creates a message and optionally attaches media files (as multipart).",
        methods=["POST"],
    )
    @transaction.atomic
    def post(self, request: Request, format=None) -> Response:
        try:
            user = request.user
            data = request.data.copy()
            files = request.FILES.getlist('media')
            data['user'] = user.id
            data['is_active'] = True

            serializer = MessageCreateSerializer(
                data=data,
                context={'request': request}
            )
            if serializer.is_valid():
                obj = serializer.save()

                for media in files:
                    prep_data = {'file': media, "message": obj.id}
                    media_serializer = MessageMediaCreateSerializer(
                        data=prep_data,
                        context={'request': request}
                    )
                    if media_serializer.is_valid():
                        media_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            media_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST
                        )

                return Response(
                    {"message": "success",
                     "result": MessageSerializer(
                         obj,
                         context={"request": request}
                     ).data},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    serializer.errors,
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            print(e)
            return Response(
                {'detail': 'Something went wrong. please try later'},
                status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=["Chat"])
class LiveKitTokenView(APIView):
    """
    Generate a LiveKit access token for the authenticated user to join a video call room.

    The room is created automatically if it does not exist. Returns the JWT token,
    the LiveKit server URL, and the room ID for the frontend to connect.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=LiveKitTokenRequestSerializer,
        responses={
            200: LiveKitTokenResponseSerializer,
            400: OpenApiResponse(
                description="Bad request, e.g., missing room_id or token generation failure."
            )
        },
        summary="Generate LiveKit access token for a video call",
        description="Creates or retrieves a chat room and returns a JWT for connecting to the LiveKit server."
    )
    def post(self, request, format=None):
        room_id = request.data.get("room_id")
        user = request.user
        if not room_id:
            return Response(
                {"detail": "room_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Ensure the room exists
            room, created = Room.objects.get_or_create(id=room_id)

            if not user in room.participants.all():
                return Response(
                    {
                        "detail": "You are not authorized to join this room.",
                    },
                    status=status.HTTP_401_UNAUTHORIZED
                )

            # Generate LiveKit access token
            token = api.AccessToken(
                settings.LIVEKIT_API_KEY,
                settings.LIVEKIT_API_SECRET
            )
            token.with_identity(user.get_full_name)
            token.with_grants(
                api.VideoGrants(room_join=True, room=room.title)
            )
            token.with_ttl(ttl=timedelta(hours=1))
            jwt = token.to_jwt()

            ice_servers_qs = IceServer.objects.filter(
                is_active=True
            ).order_by("priority")
            ice_servers = [server.as_dict() for server in ice_servers_qs]

            return Response(
                {
                    "token": jwt,
                    "livekit_url": settings.LIVEKIT_WS_URL,
                    "room_id": room.id,
                    "room_name": room.title,
                    "room_type": room.type,
                    "ice_servers": ice_servers,
                }, status=status.HTTP_200_OK
            )
        except Exception as e:
            print("LiveKit token generation error:", e)
            return Response(
                {"detail": "Could not generate LiveKit token"},
                status=status.HTTP_400_BAD_REQUEST
            )




@extend_schema(
    tags=["Chat"],
    summary="Create a new group chat room",
    description=(
        "Creates a new **group chat** with a custom title, description, and list of participants.\n\n"
        "Notes:\n"
        "- The authenticated user is **automatically added** to the group participants.\n"
        "- At least **2 other users** must be provided (minimum 3 total).\n"
        "- Returns the full room object including participants and metadata.\n"
    ),
    request=GroupCreateSerializer,
    responses={
        201: OpenApiResponse(
            response=RoomSerializer,
            description="Group room successfully created."
        ),
        400: OpenApiResponse(
            description="Validation error (e.g. missing fields, invalid participants)."
        ),
        401: OpenApiResponse(
            description="Unauthorized (user not authenticated)."
        ),
    },
    examples=[
        OpenApiExample(
            name="Create simple group",
            description="Basic example of creating a group chat.",
            value={
                "title": "Developers Group",
                "description": "Frontend + backend discussions.",
                "participants": [12, 18, 19]
            },
            request_only=True,
        ),
    ]
)
class GroupCreateView(APIView):
    serializer_class = GroupCreateSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = GroupCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        participants = ser.validated_data["participants"]
        title = ser.validated_data["title"]
        description = ser.validated_data.get("description", "")

        # Add creator automatically
        participants.append(request.user.id)

        room = Room.objects.create(
            type=Room.TypeChoices.GROUP,
            title=title,
            description=description,
            created_by=request.user
        )
        room.participants.set(participants)

        return Response(
            RoomSerializer(room).data,
            status=status.HTTP_201_CREATED
        )



@extend_schema(
    tags=["Chat"],
    summary="Update group chat information",
    description=(
        "Updates an existing **group chat room's profile**, including:\n"
        "- `title`\n"
        "- `description`\n"
        "- `avatar` (image upload)\n\n"
        "**Notes:**\n"
        "- Only authenticated users who are already participants of the group can update it.\n"
        "- The request must be sent as **multipart/form-data** when uploading an avatar.\n"
        "- All fields are optional. Only provided fields will be updated.\n"
    ),
    request={
        "multipart/form-data": GroupUpdateSerializer
    },
    responses={
        200: OpenApiResponse(
            response=RoomSerializer,
            description="Group updated successfully."
        ),
        400: OpenApiResponse(
            description="Validation error (e.g., invalid image, invalid fields)."
        ),
        401: OpenApiResponse(
            description="Unauthorized (user not authenticated)."
        ),
        404: OpenApiResponse(
            description="Group not found."
        ),
    },
    examples=[
        OpenApiExample(
            name="Update title and description",
            description="Patch only the group text fields.",
            value={
                "title": "New Project Discussion",
                "description": "Updated group description."
            },
            request_only=True,
        ),
        OpenApiExample(
            name="Update avatar (multipart/form-data)",
            description="Example of sending an image in FormData.",
            value={
                "avatar": "<binary image data>",
                "title": "Team Alpha"
            },
            request_only=True,
            media_type="multipart/form-data",
        ),
    ],
)
class GroupUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        serializer = GroupUpdateSerializer(
            instance=room,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(RoomSerializer(room).data, status=200)



@extend_schema(
    tags=["Chat"],
    summary="Add participants to a group",
    description=(
        "Adds one or more users to a **group chat room**.\n"
        "- Only existing participants may add new participants.\n"
        "- The request body must include a list of user IDs.\n"
    ),
    request=AddParticipantsSerializer,
    responses={200: RoomSerializer},
    examples=[
        OpenApiExample(
            "Add users",
            value={"participants": [12, 18]},
            request_only=True
        )
    ]
)
class GroupAddParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        if request.user not in room.participants.all():
            return Response({"detail": "Not authorized."}, status=403)

        serializer = AddParticipantsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_users = serializer.validated_data["participants"]

        room.participants.add(*new_users)

        return Response(RoomSerializer(room).data, status=200)

@extend_schema(
    tags=["Chat"],
    summary="Remove participants from a group",
    description=(
        "Removes one or more participants from a **group chat room**.\n"
        "- You cannot remove the group creator.\n"
        "- Only existing participants may perform this action.\n"
    ),
    request=RemoveParticipantsSerializer,
    responses={200: RoomSerializer},
    examples=[
        OpenApiExample(
            "Remove users",
            value={"participants": [22, 35]},
            request_only=True
        )
    ]
)
class GroupRemoveParticipantsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        if request.user not in room.participants.all():
            return Response({"detail": "Not authorized."}, status=403)

        serializer = RemoveParticipantsSerializer(
            data=request.data,
            context={"room": room}
        )
        serializer.is_valid(raise_exception=True)

        users = serializer.validated_data["participants"]

        room.participants.remove(*users)

        return Response(RoomSerializer(room).data, status=200)


@extend_schema(
    tags=["Chat"],
    summary="Leave a group chat",
    description=(
        "Allows a participant to leave a **group chat**.\n\n"
        "- If the user is the **creator**, they must transfer ownership first.\n"
        "- After leaving, the user is removed from the participants list.\n"
    ),
    responses={
        200: OpenApiResponse(RoomSerializer),
        403: OpenApiResponse(description="Cannot leave as creator without transferring ownership."),
        404: OpenApiResponse(description="Group not found."),
    }
)
class GroupLeaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        user = request.user

        if user not in room.participants.all():
            return Response({"detail": "You are not a member of this group."}, status=403)

        # Creator cannot leave without transferring ownership
        if room.created_by == user:
            return Response(
                {"detail": "You are the group creator. Transfer ownership before leaving."},
                status=403
            )

        room.participants.remove(user)
        return Response({"detail": "You left the group successfully."}, status=200)


@extend_schema(
    tags=["Chat"],
    summary="Transfer group ownership",
    description=(
        "Allows the **group creator** to pass ownership to another participant.\n\n"
        "Rules:\n"
        "- Only creator can perform this\n"
        "- New owner must already be a participant\n"
    ),
    request=TransferOwnershipSerializer,
    responses={
        200: RoomSerializer,
        403: OpenApiResponse(description="Not allowed."),
        404: OpenApiResponse(description="Group not found."),
    }
)
class GroupTransferOwnershipView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        if room.created_by != request.user:
            return Response({"detail": "Only the group creator can transfer ownership."}, status=403)

        serializer = TransferOwnershipSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_owner = serializer.validated_data["new_owner_id"]

        if new_owner not in room.participants.all():
            return Response({"detail": "New owner must be a participant of the group."}, status=403)

        room.created_by = new_owner
        room.save()

        return Response(RoomSerializer(room).data, status=200)


@extend_schema(
    tags=["Chat"],
    summary="Delete a group chat",
    description=(
        "Deletes a **group chat room**. Only the creator may perform this action.\n"
        "- Removes all participants\n"
        "- Deletes room from database\n"
    ),
    responses={
        200: OpenApiResponse(description="Group deleted successfully."),
        403: OpenApiResponse(description="Only creator can delete group."),
        404: OpenApiResponse(description="Group not found."),
    }
)
class GroupDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, group_id):
        try:
            room = Room.objects.get(id=group_id, type=Room.TypeChoices.GROUP)
        except Room.DoesNotExist:
            return Response({"detail": "Group not found."}, status=404)

        if room.created_by != request.user:
            return Response({"detail": "Only the creator can delete this group."}, status=403)

        room.delete()
        return Response({"detail": "Group deleted successfully."}, status=200)
