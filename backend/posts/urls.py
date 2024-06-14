from django.urls import path
from .views import PostListCreateView

app_name = 'posts'

urlpatterns = [
    path('', PostListCreateView.as_view(), name='list_create'),
]
