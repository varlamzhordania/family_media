from django.urls import path
from rest_framework import routers

from .views import EventViewSet, InvitationView

app_name = 'v1-events'
router = routers.SimpleRouter()
router.register(r'', EventViewSet, basename='events')

urlpatterns = [
    path("invitations/", InvitationView.as_view(), name='invitation_view')
]

urlpatterns += router.urls
