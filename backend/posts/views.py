from django.shortcuts import get_object_or_404

from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from django.db import transaction

from main.models import FamilyMembers

from .models import Post, PostMedia, PostLike, Comment, CommentLike
from .serializers import PostCreateSerializer, PostSerializer, PostMediaSerializer, CommentSerializer, \
    CommentCreateSerializer
from .permissions import FamilyAccess


@extend_schema(tags=['Posts'])
class PostListCreateView(ListAPIView, CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            user_families = FamilyMembers.objects.filter(member=user).values_list('family', flat=True)
            return Post.objects.filter(author__family__in=user_families, is_active=True).order_by('-created_at')
        except FamilyMembers.DoesNotExist:
            return Post.objects.none()

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data.copy()
            files = request.FILES.getlist('media')
            cover_image = request.FILES.get('cover_image')

            family_member = FamilyMembers.objects.filter(member=user).first()
            if not family_member:
                return Response({'message': 'User is not a member of any family'}, status=status.HTTP_400_BAD_REQUEST)

            data['author'] = family_member.id
            data['is_active'] = True

            serializer = PostCreateSerializer(data=data)
            if serializer.is_valid():
                post = serializer.save()

                if cover_image:
                    PostMedia.objects.create(post=post, file=cover_image, is_featured=True)

                for file in files:
                    print(file)
                    PostMedia.objects.create(post=post, file=file)

                return Response(
                    {'message': 'success', 'post': PostSerializer(post, context={'request': request}).data},
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'message': f'Something went wrong: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(tags=['Posts'])
class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data

            # Retrieve the post and user_family safely
            post = get_object_or_404(Post, id=data['post'])
            user_family = get_object_or_404(FamilyMembers, member=user, family=post.author.family)

            likes_info = post.like_info

            # Handle the like/unlike action
            if data["action"] == "LIKE":
                if not likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.add(user_family)
                    likes_info.increment_counter()
                    action = 'liked'
                else:
                    return Response({'details': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
            elif data["action"] == "UNLIKE":
                if likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.remove(user_family)
                    likes_info.decrement_counter()
                    action = 'unliked'
                else:
                    return Response({'details': 'Not liked yet'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'details': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {'message': f'Successfully {action}', 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except PostLike.DoesNotExist:
            return Response({'details': 'cannot like this post yet'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=['Posts', 'Comments'])
class CommentModelViewSet(ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [FamilyAccess]
    queryset = Comment.objects.filter(is_active=True, level=0).order_by('-id')
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('post',)
    model = Comment

    @transaction.atomic
    def create(self, request: Request, *args, **kwargs):
        user = request.user
        data = request.data.copy()

        # Fetching post with a detailed error message if not found
        post = get_object_or_404(Post, pk=data.get('post_id'))

        # Ensuring the family member exists with a detailed error message if not found
        family_member = get_object_or_404(
            FamilyMembers,
            member=user,
            family=post.author.family,
        )

        # Updating data with fetched ids
        data['post'] = post.pk
        data['author'] = family_member.id

        serializer = CommentCreateSerializer(data=data)
        serializer.is_valid(raise_exception=True)

        comment = serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


@extend_schema(tags=['Posts', 'Comments'])
class CommentLikeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data

            # Retrieve the post and user_family safely
            comment = get_object_or_404(Comment, id=data['comment'])
            user_family = get_object_or_404(FamilyMembers, member=user, family=comment.author.family)

            likes_info = comment.like_info

            # Handle the like/unlike action
            if data["action"] == "LIKE":
                if not likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.add(user_family)
                    likes_info.increment_counter()
                    action = 'liked'
                else:
                    return Response({'details': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
            elif data["action"] == "UNLIKE":
                if likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.remove(user_family)
                    likes_info.decrement_counter()
                    action = 'unliked'
                else:
                    return Response({'details': 'Not liked yet'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({'details': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {'message': f'Successfully {action}', 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except CommentLike.DoesNotExist:
            return Response({'details': 'cannot like this comment yet'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
