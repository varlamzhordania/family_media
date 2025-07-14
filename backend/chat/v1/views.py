from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter, OpenApiTypes
from django.db import transaction

from .serializers import MessageMediaCreateSerializer, MessageSerializer, MessageCreateSerializer


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
            400: OpenApiResponse(description="Validation errors during message or media creation."),
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

            serializer = MessageCreateSerializer(data=data, context={'request': request})
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
                        return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                return Response(
                    {"message": "success",
                     "result": MessageSerializer(obj, context={"request": request}).data},
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            return Response({'detail':'Something went wrong. please try later'},status=status.HTTP_400_BAD_REQUEST)