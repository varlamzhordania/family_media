from datetime import timedelta
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import (
    extend_schema, OpenApiResponse,
)
from django.db import transaction
from django.conf import settings
from livekit import api

from .serializers import (
    MessageMediaCreateSerializer, MessageSerializer,
    MessageCreateSerializer,
    LiveKitTokenRequestSerializer,
    LiveKitTokenResponseSerializer,
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
