from django.urls import path

from .views import UserView

app_name = 'accounts'

urlpatterns = [
    path('user/', UserView.as_view(), name="user_data"),
]
