from django.urls import path
from .views import PostListCreateView, PostLikeView, CommentModelViewSet, CommentLikeView
from rest_framework.routers import SimpleRouter

app_name = 'posts'

router = SimpleRouter()
router.register(r'comments', CommentModelViewSet, basename='comments')

urlpatterns = [
    path('', PostListCreateView.as_view(), name='list_create'),
    path('like/', PostLikeView.as_view(), name='like'),
    path('comments/like/', CommentLikeView.as_view(), name='like'),
]
urlpatterns += router.urls
