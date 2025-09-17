from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from django.conf import settings
from drf_spectacular.utils import extend_schema

from .serializers import ConfigSerializer


@extend_schema(tags=["Settings"])
class ConfigApiView(APIView):
    serializer_class = ConfigSerializer

    def get(self, request: Request, format=None, **kwargs) -> Response:
        data = {
            "google_public_key": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "android_google_public_key": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "ios_google_public_key": settings.SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
            "facebook_public_key": settings.SOCIAL_AUTH_FACEBOOK_OAUTH2_KEY,
        }

        serializer = self.serializer_class(
            data,
            many=False,
            context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
