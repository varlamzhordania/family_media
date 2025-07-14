from django.urls import path

from .views import MessageView

app_name = 'v1-chat'

urlpatterns = [
    path('', MessageView.as_view(), name='message_view')
]
