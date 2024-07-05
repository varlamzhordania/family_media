from typing import Dict, Optional

from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from rest_framework.request import Request
from django.contrib.auth.tokens import default_token_generator
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model
from django.views import View

from .tokens import email_verification_token
from .serializers import UserSerializer, UserCreateSerializer, PasswordResetRequestSerializer, \
    PasswordResetConfirmSerializer
from .helpers import send_email_verification, send_password_reset_email
from .models import User

from main.serializers import FamilyMembersSerializer


class UserCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserCreateSerializer

    def post(self, request: Request, format=None, *args, **kwargs) -> Response:
        """
        Create a new user.
        """
        try:
            data = request.data.copy()
            password1 = data.get('password1')
            password2 = data.get('password2')

            if not password1 or not password2:
                return Response({'detail': 'Both password fields are required.'}, status=status.HTTP_400_BAD_REQUEST)

            if password1 != password2:
                return Response({'detail': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

            data['password'] = password1
            serializer = self.serializer_class(data=data, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'detail': 'During registration process something went wrong.\n please try later.'},
                status=status
            )


@extend_schema(tags=["Account"])
class UserView(APIView):
    """
    UserView to handle retrieving and updating user information.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request: Request, format=None, *args, **kwargs) -> Response:
        """
        Retrieve the authenticated user's details and active memberships.
        """
        user = request.user
        memberships = user.my_memberships.filter(is_active=True)
        user_serializer = self.serializer_class(user, context={'request': request})
        memberships_serializer = FamilyMembersSerializer(memberships, many=True, context={'request': request})

        return Response(
            {
                "user": user_serializer.data,
                "memberships": memberships_serializer.data
            }, status=status.HTTP_200_OK
        )

    def patch(self, request: Request, format=None, *args, **kwargs) -> Response:
        """
        Update the authenticated user's information.
        """
        user = request.user
        serializer = self.serializer_class(user, data=request.data, context={'request': request}, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Account"])
class RequestEmailVerification(APIView):
    """
    API view to request an email verification link.
    This view will send an email verification link to the user's email address.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request: Request, format=None) -> Response:
        """
        Handle GET request to send an email verification link.
        """
        user: User = request.user
        try:
            # Call a utility function to send the email verification link
            if not user.email_verified:
                send_email_verification(user)
                return Response(status=status.HTTP_200_OK)
            else:
                return Response({"details": "Your email address already verified."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Return an error response if any exception occurs
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(tags=["Account"])
class VerifyEmailView(View):
    """
    View to handle email verification via a unique token.
    This view will verify the token and activate the user's email if valid.
    """

    def get(self, request, uidb64, token):
        """
        Handle GET request to verify the email token.
        """
        try:
            # Decode the user ID from the base64 encoded string
            uid = force_str(urlsafe_base64_decode(uidb64))
            # Get the user object corresponding to the decoded user ID
            user = get_object_or_404(get_user_model(), pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            # Handle exceptions and set user to None if any error occurs
            user = None

        if user is not None and email_verification_token.check_token(user, token):
            # If the user exists and the token is valid, mark the email as verified
            user.email_verified = True
            user.save()
            return HttpResponse('Email verified successfully. You can close this window now.')
        else:
            # If the token is invalid or the user does not exist, return an error response
            return HttpResponse('Invalid verification link.', status=400)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = User.objects.get(email=serializer.validated_data['email'])
            send_password_reset_email(user)
            return Response({"message": "Password reset link sent to your email."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response({"message": "Password has been reset successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
