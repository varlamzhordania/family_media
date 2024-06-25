from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from .serializers import UserSerializer

from main.serializers import FamilyMembersSerializer


@extend_schema(tags=["Account"])
class UserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request, format=None, *args, **kwargs):
        user = request.user
        memberships = user.my_memberships.filter(is_active=True)
        serializer = self.serializer_class(user)
        serializer_membership = FamilyMembersSerializer(memberships, many=True, context={'request': request})
        return Response({"user": serializer.data, "memberships": serializer_membership.data}, status=status.HTTP_200_OK)
