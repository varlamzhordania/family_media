from rest_framework import status, permissions, viewsets, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import (
    extend_schema, OpenApiResponse,
    OpenApiParameter,
)
from rest_framework.request import Request
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from django.contrib.auth import get_user_model
from django.views import View
from django.db import transaction

from main.v1.serializers import FamilyMembersSerializer

from accounts.tokens import email_verification_token
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    RelationSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    FriendshipSerializer,
    PublicUserSerializer,
    UserDetailResponseSerializer,
    FriendActionSerializer,
)
from accounts.helpers import (
    send_email_verification,
    send_password_reset_email,
)
from accounts.models import User, Friendship, Relation


@extend_schema(tags=['Account'])
class UserCreateAPIView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserCreateSerializer

    @extend_schema(
        request=UserCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=UserSerializer,
                description="User created successfully."
            ),
            400: OpenApiResponse(
                description="Validation errors"
            ),
        },
        summary="Register a new user",
        description="Creates a new user account after validating password fields."
    )
    def post(self, request: Request, format=None) -> Response:
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'detail': 'User created successfully.',
                 'user': UserSerializer(user).data},
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=["Account"])
class UserView(APIView):
    """
    UserView to handle retrieving and updating user information.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        summary="Retrieve current user info",
        description="Fetch the authenticated user's details, their memberships, and friends.",
        responses={
            200: UserDetailResponseSerializer,
            403: OpenApiResponse(description="Not authenticated")
        }
    )
    def get(
            self,
            request: Request,
            format=None,
            *args,
            **kwargs
            ) -> Response:
        """
        Retrieve the authenticated user's details and active memberships.
        """
        user = request.user
        memberships = user.my_memberships.filter(is_active=True)
        friends = user.get_friends()
        user_serializer = self.serializer_class(
            user,
            context={'request': request}
            )
        memberships_serializer = FamilyMembersSerializer(
            memberships,
            many=True,
            context={'request': request}
        )
        friends_serializer = PublicUserSerializer(
            friends,
            many=True,
            context={'request': request}
            )

        return Response(
            {
                "user": user_serializer.data,
                "memberships": memberships_serializer.data,
                "friends": friends_serializer.data,
            }, status=status.HTTP_200_OK
        )

    @transaction.atomic
    def patch(
            self,
            request: Request,
            format=None,
            *args,
            **kwargs
            ) -> Response:
        """
        Update the authenticated user's information.
        """
        user = request.user
        serializer = self.serializer_class(
            user,
            data=request.data,
            context={'request': request},
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
            )


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
                return Response(
                    {"details": "Your email address already verified."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            # Return an error response if any exception occurs
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
                )


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

        if user is not None and email_verification_token.check_token(
                user,
                token
                ):
            # If the user exists and the token is valid, mark the email as verified
            user.email_verified = True
            user.save()
            return HttpResponse(
                'Email verified successfully. You can close this window now.'
                )
        else:
            # If the token is invalid or the user does not exist, return an error response
            return HttpResponse('Invalid verification link.', status=400)


@extend_schema(
    tags=["Account"],
    request=PasswordResetRequestSerializer,
    responses={
        200: OpenApiResponse(
            description="Password reset link sent to your email."
            ),
        400: OpenApiResponse(
            description="Invalid email or malformed request."
            ),
    },
    summary="Request password reset",
    description="Send a password reset link to the user's email if the address is valid and exists in the system."
)
class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
            )
        if serializer.is_valid():
            user = User.objects.get(
                email=serializer.validated_data['email']
                )
            send_password_reset_email(user)
            return Response(
                {"message": "Password reset link sent to your email."},
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(
    tags=["Account"],
    request=PasswordResetConfirmSerializer,
    responses={
        200: OpenApiResponse(
            description="Password has been reset successfully."
            ),
        400: OpenApiResponse(
            description="Invalid token, user ID, or password data."
            ),
    },
    summary="Confirm password reset",
    description="Confirms a password reset using the provided UID, token, and new password. Typically used after clicking the reset link from the email."
)
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            return Response(
                {"message": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
            )


@extend_schema(tags=["Account"])
class RelationViewSet(viewsets.ModelViewSet):
    serializer_class = RelationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Relation.objects.filter(
            is_active=True,
            user=self.request.user
            )

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        obj = get_object_or_404(queryset, pk=self.kwargs.get('pk'))
        self.check_object_permissions(self.request, obj)
        return obj

    @extend_schema(
        request=RelationSerializer,
        responses={
            200: RelationSerializer(many=True),
            400: OpenApiResponse(description="Invalid update data"),
        },
        summary="Partially update a relation",
        description="Allows the authenticated user to update an existing relation with a specific related user. If no relation exists, creates a new one."
    )
    @transaction.atomic
    def partial_update(
            self,
            request: Request,
            *args,
            **kwargs
            ) -> Response:
        user = request.user
        data = request.data.copy()
        data['user'] = user.pk
        related_id = data.get('related')

        queryset = Relation.objects.filter(user=user, related=related_id)
        relation = queryset.first() if queryset.exists() else None

        serializer = RelationSerializer(
            relation,
            data=data,
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            new_query = self.get_queryset()
            new_serializer = RelationSerializer(
                new_query,
                many=True,
                context={'request': request}
                )
            return Response(new_serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
                )


@extend_schema(
    tags=["Account"],
    parameters=[
        OpenApiParameter(
            name='user_id',
            type=int,
            location=OpenApiParameter.PATH,
            description="ID of the user to act upon"
        ),
    ],
    request=FriendActionSerializer,
    responses={
        201: OpenApiResponse(
            description="Friend request sent or friend removed successfully."
            ),
        200: OpenApiResponse(
            description="Friend request accepted or declined successfully."
            ),
        400: OpenApiResponse(
            description="Bad request, e.g. invalid action or already sent."
            ),
        404: OpenApiResponse(
            description="User or friend request not found."
            ),
    }
)
class FriendRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(
            self,
            request: Request,
            user_id: int,
            *args,
            **kwargs
            ) -> Response:
        data = request.data.copy()
        action = data.get('action')
        if not action:
            return Response(
                {'detail', 'Action required.'},
                status=status.HTTP_400_BAD_REQUEST
                )

        if action == 'request':
            to_user = get_object_or_404(get_user_model(), id=user_id)
            if request.user.send_friend_request(to_user):
                return Response(
                    {"detail": "Friend request sent successfully."},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                {"detail": "Friend request already sent or invalid."},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif action == 'accept':
            from_user = get_object_or_404(get_user_model(), id=user_id)
            if request.user.accept_friend_request(from_user):
                return Response(
                    {"detail": "Friend request accepted successfully."},
                    status=status.HTTP_200_OK
                )
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        elif action == 'decline':
            from_user = get_object_or_404(get_user_model(), id=user_id)
            if request.user.decline_friend_request(from_user):
                return Response(
                    {"detail": "Friend request declined successfully."},
                    status=status.HTTP_200_OK
                )
            return Response(
                {"detail": "Friend request not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        elif action == 'remove':
            friend_user = get_object_or_404(get_user_model(), id=user_id)
            request.user.remove_friend(friend_user)
            return Response(
                {"detail": "Friend removed successfully."},
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {"detail": "Invalid action."},
                status=status.HTTP_400_BAD_REQUEST
                )


@extend_schema(tags=["Account"])
class FriendRequestListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = FriendshipSerializer
    pagination_class = None

    def get_queryset(self):
        return Friendship.objects.filter(
            to_user=self.request.user,
            status=Friendship.StatusChoices.REQUESTED
        )
