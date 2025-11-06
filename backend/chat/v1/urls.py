from django.urls import path

from .views import MessageView, LiveKitTokenView

app_name = 'v1-chat'

urlpatterns = [
    path('', MessageView.as_view(), name='message_view'),
    path(
        'livekit/token/',
        LiveKitTokenView.as_view(),
        name='livekit_token_view'
    ),
]
