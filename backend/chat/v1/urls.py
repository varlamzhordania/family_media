from django.urls import path

from .views import (
    MessageView, LiveKitTokenView, GroupCreateView,
    GroupUpdateView, GroupAddParticipantsView, GroupRemoveParticipantsView,
    GroupLeaveView, GroupTransferOwnershipView, GroupDeleteView,
)

app_name = 'v1-chat'

urlpatterns = [
    path('', MessageView.as_view(), name='message_view'),
    path('groups/', GroupCreateView.as_view(), name='group_create'),
    path("groups/<int:group_id>/", GroupUpdateView.as_view()),
    path("groups/<int:group_id>/participants/add/", GroupAddParticipantsView.as_view()),
    path("groups/<int:group_id>/participants/remove/", GroupRemoveParticipantsView.as_view()),
    path("groups/<int:group_id>/leave/", GroupLeaveView.as_view()),
    path("groups/<int:group_id>/transfer-owner/", GroupTransferOwnershipView.as_view()),
    path("groups/<int:group_id>/delete/", GroupDeleteView.as_view()),
    path(
        'livekit/token/',
        LiveKitTokenView.as_view(),
        name='livekit_token_view'
    ),
]
