from django.urls import re_path
from .consumers import UserConsumer

app_name = 'accounts'

urlpatterns = [
    re_path(r'ws/user/', UserConsumer.as_asgi(), name='ws_user')
]
