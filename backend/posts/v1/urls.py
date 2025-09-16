from django.urls import path
from .views import (
    PostListCreateView, PostSelfListView, PostLikeView,
    CommentModelViewSet,
    CommentLikeView, PostRetrieveUpdateDeleteView, PostMediaManageView,
)
from rest_framework.routers import SimpleRouter

app_name = 'v1-posts'

router = SimpleRouter()
router.register(r'comments', CommentModelViewSet, basename='comments')

urlpatterns = [
    path('', PostListCreateView.as_view(), name='list_create'),
    path(
        '<int:pk>/',
        PostRetrieveUpdateDeleteView.as_view(),
        name='post_detail'
    ),
    # media management
    path(
        '<int:post_id>/media/',
        PostMediaManageView.as_view(),
        name='post_media_add'
    ),
    path(
        '<int:post_id>/media/<int:media_id>/',
        PostMediaManageView.as_view(),
        name='post_media_delete'
    ),
    path('self/', PostSelfListView.as_view(), name='list_self'),
    path('like/', PostLikeView.as_view(), name='like'),
    path('comments/like/', CommentLikeView.as_view(), name='like'),
]
urlpatterns += router.urls
