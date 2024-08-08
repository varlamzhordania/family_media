from django.urls import path
from rest_framework.routers import SimpleRouter

from .views import UserCreateAPIView, UserView, RelationViewSet, VerifyEmailView, RequestEmailVerification, \
    PasswordResetRequestView, PasswordResetConfirmView, FriendRequestView,FriendRequestListView

app_name = 'accounts'

router = SimpleRouter()

router.register(r'user/relations', RelationViewSet, basename='relations')

urlpatterns = [
    path('user/verify_email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('user/verify_email/send/', RequestEmailVerification.as_view(), name='verify_email_send'),
    path('user/', UserView.as_view(), name="user_data"),
    path('user/register/', UserCreateAPIView.as_view(), name="user_create"),
    path('user/password-reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('user/password-reset-confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('user/friend-request/<int:user_id>/', FriendRequestView.as_view(), name='friend_request'),
    path('user/friend-requests/', FriendRequestListView.as_view(), name='friend_requests'),
]

urlpatterns += router.urls
