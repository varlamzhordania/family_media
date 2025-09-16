from django.urls import path
from .views import ConfigApiView

app_name = 'v1-settings'

urlpatterns = [
    path('config/', ConfigApiView.as_view()),
]
