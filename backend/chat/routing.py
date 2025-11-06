from django.urls import re_path
from .consumers import ChatConsumer, VideoCallConsumer

app_name = 'chat'

urlpatterns = [
    re_path(r'ws/chat/(?P<room_id>\w+)/$', ChatConsumer.as_asgi()),
    re_path(
        r'ws/videocall/(?P<room_id>\w+)/$',
        VideoCallConsumer.as_asgi()
    ),
]
