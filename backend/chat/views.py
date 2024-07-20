from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.permissions import IsAuthenticated
from rest_framework import static, status
from django.db import transaction

from .models import MessageMedia
from .serializers import MessageMediaCreateSerializer, MessageSerializer, MessageCreateSerializer


class MessageView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request: Request, format=None) -> Response:
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
                media_serializer = MessageMediaCreateSerializer(data=prep_data, context={'request': request})
                if media_serializer.is_valid():
                    media_serializer.save()
                else:
                    transaction.set_rollback(True)
                    return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {"message": "success", "result": MessageSerializer(obj, context={"request": request}).data},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
