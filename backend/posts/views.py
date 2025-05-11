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
from .serializers import PostCreateSerializer, PostSerializer, PostMediaSerializer, \
    PostMediaCreateSerializer, \
    CommentSerializer, CommentCreateSerializer
from .permissions import FamilyAccess


@extend_schema(tags=['Posts'])
class PostListCreateView(ListAPIView, CreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        family_param = self.request.query_params.get('family', None)

        try:
            user_families = FamilyMembers.objects.filter(member=user).values_list(
                'family',
                flat=True
            )

            # If the 'family' query parameter is provided, filter by it
            if family_param:
                # Ensure that the user has access to the family specified in the query parameter
                if int(family_param) in user_families:
                    return Post.objects.filter(
                        author__family=family_param,
                        is_active=True
                    ).order_by('-created_at')
                else:
                    return Post.objects.none()
            else:
                return Post.objects.filter(
                    author__family__in=user_families,
                    is_active=True
                ).order_by('-created_at')

        except FamilyMembers.DoesNotExist:
            return Post.objects.none()

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data.copy()
            files = request.FILES.getlist('media')
            cover_image = request.FILES.get('cover_image')
            family = data['family']

            family_member = FamilyMembers.objects.get(member=user, family=family)

            data['author'] = family_member.id
            data['is_active'] = True

            serializer = PostCreateSerializer(data=data)
            if serializer.is_valid():
                post = serializer.save()

                if cover_image:
                    media_data = {'post': post.id, 'file': cover_image, 'is_featured': True}
                    media_serializer = PostMediaCreateSerializer(data=media_data)
                    if media_serializer.is_valid():
                        media_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                for file in files:
                    media_data = {'post': post.id, 'file': file}
                    media_serializer = PostMediaCreateSerializer(data=media_data)
                    if media_serializer.is_valid():
                        media_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(media_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

                return Response(
                    {'message': 'success',
                     'post': PostSerializer(post, context={'request': request}).data},
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except FamilyMembers.DoesNotExist:
            transaction.set_rollback(True)
            return Response(
                {'detail': 'You are not a member of selected family.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            transaction.set_rollback(True)
            return Response(
                {'message': f'Something went wrong: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@extend_schema(tags=['Posts'])
class PostSelfListView(ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        try:
            queryset = Post.objects.filter(author=user, is_active=True).order_by('-created_at')
            return queryset
        except:
            return Post.objects.none()


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
                    return Response(
                        {'details': 'Already liked'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif data["action"] == "UNLIKE":
                if likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.remove(user_family)
                    likes_info.decrement_counter()
                    action = 'unliked'
                else:
                    return Response(
                        {'details': 'Not liked yet'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response({'details': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {'message': f'Successfully {action}', 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except PostLike.DoesNotExist:
            return Response(
                {'details': 'cannot like this post yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@extend_schema(tags=['Comments'])
class CommentModelViewSet(ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
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


@extend_schema(tags=['Comments'])
class CommentLikeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data

            # Retrieve the post and user_family safely
            comment = get_object_or_404(Comment, id=data['comment'])
            user_family = get_object_or_404(
                FamilyMembers,
                member=user,
                family=comment.author.family
            )

            likes_info = comment.like_info

            # Handle the like/unlike action
            if data["action"] == "LIKE":
                if not likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.add(user_family)
                    likes_info.increment_counter()
                    action = 'liked'
                else:
                    return Response(
                        {'details': 'Already liked'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif data["action"] == "UNLIKE":
                if likes_info.users.filter(id=user_family.id).exists():
                    likes_info.users.remove(user_family)
                    likes_info.decrement_counter()
                    action = 'unliked'
                else:
                    return Response(
                        {'details': 'Not liked yet'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            else:
                return Response({'details': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)

            return Response(
                {'message': f'Successfully {action}', 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except CommentLike.DoesNotExist:
            return Response(
                {'details': 'cannot like this comment yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response({'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
