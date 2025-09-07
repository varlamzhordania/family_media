from django.shortcuts import get_object_or_404

from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.request import Request
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import (
    extend_schema, OpenApiResponse, OpenApiParameter, OpenApiTypes,
    OpenApiExample,
)
from django.db import transaction

from core.mixins import OptionalPaginationMixin
from main.models import FamilyMembers

from posts.models import Post, PostLike, Comment, CommentLike

from .serializers import (
    PostCreateSerializer, PostSerializer,
    PostMediaCreateSerializer,
    CommentSerializer, CommentCreateSerializer,
)


@extend_schema(
    tags=['Posts'],
    parameters=[
        OpenApiParameter(
            name='family',
            description='Optional family ID to filter posts for a specific family',
            required=False,
            type=int,
            location=OpenApiParameter.QUERY
        )
    ]
)
class PostListCreateView(
    OptionalPaginationMixin,
    ListAPIView,
    CreateAPIView
):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        family_param = self.request.query_params.get('family', None)

        try:
            user_families = FamilyMembers.objects.filter(
                member=user
            ).values_list(
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

    @extend_schema(
        summary="Create a new post",
        description=(
                "Creates a new post for a family the user is a member of. "
                "Supports multiple media files and an optional cover image. "
                "The request accepts `media` (list of files) and `cover_image` (single file)."
        ),
        request=OpenApiTypes.OBJECT,
        # or PostCreateSerializer if you want to keep body schema
        responses={
            201: OpenApiResponse(
                response=PostSerializer,
                description="Post created successfully (with media included)."
            ),
            400: OpenApiResponse(
                response=PostMediaCreateSerializer,  # 👈 add it here
                description="Validation error (post or media)."
            ),
            500: OpenApiResponse(description="Unexpected server error.")
        },
        examples=[
            OpenApiExample(
                "Example request",
                summary="Create post with media",
                description="Multipart form with text + files.",
                value={
                    "family": 1,
                    "content": "Some post text",
                    "media": ["file1.png", "file2.jpg"],
                    "cover_image": "cover.png"
                },
                request_only=True
            )
        ]
    )
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data.copy()
            files = request.FILES.getlist('media')
            cover_image = request.FILES.get('cover_image')
            family = data['family']

            family_member = FamilyMembers.objects.get(
                member=user,
                family=family
            )

            data['author'] = family_member.id
            data['is_active'] = True

            serializer = PostCreateSerializer(data=data)
            if serializer.is_valid():
                post = serializer.save()

                if cover_image:
                    media_data = {'post': post.id, 'file': cover_image,
                                  'is_featured': True}
                    media_serializer = PostMediaCreateSerializer(
                        data=media_data
                    )
                    if media_serializer.is_valid():
                        media_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            media_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST
                        )

                for file in files:
                    media_data = {'post': post.id, 'file': file}
                    media_serializer = PostMediaCreateSerializer(
                        data=media_data
                    )
                    if media_serializer.is_valid():
                        media_serializer.save()
                    else:
                        transaction.set_rollback(True)
                        return Response(
                            media_serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST
                        )

                return Response(
                    {'message': 'success',
                     'post': PostSerializer(
                         post,
                         context={'request': request}
                     ).data},
                    status=status.HTTP_201_CREATED
                )
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
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


@extend_schema(
    tags=['Posts'],
    summary="List user's own posts",
    description="Returns a list of active posts authored by the currently authenticated user, sorted by creation date.",
    responses={
        200: OpenApiResponse(
            response=PostSerializer(many=True),
            description="List of user's posts."
        ),
        401: OpenApiResponse(
            description="Authentication credentials were not provided or are invalid."
        ),
    }
)
@extend_schema(tags=['Posts'])
class PostSelfListView(OptionalPaginationMixin, ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        try:
            queryset = Post.objects.filter(
                author=user,
                is_active=True
            ).order_by('-created_at')
            return queryset
        except:
            return Post.objects.none()


@extend_schema(
    tags=['Posts'],
    summary="Like or unlike a post",
    description="""
        Allows an authenticated user to **like** or **unlike** a post.
        The user must belong to the same family as the post's author.

        Valid actions: `"LIKE"`, `"UNLIKE"`
    """,
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "post": {"type": "integer", "example": 42},
                "action": {
                    "type": "string",
                    "enum": ["LIKE", "UNLIKE"],
                    "example": "LIKE"
                }
            },
            "required": ["post", "action"]
        }
    },
    responses={
        200: OpenApiResponse(
            response=OpenApiTypes.OBJECT,
            description="Action successful",
            examples=[
                OpenApiExample(
                    "Like Success",
                    value={"message": "Successfully liked",
                           "likes_count": 7}
                ),
                OpenApiExample(
                    "Unlike Success",
                    value={"message": "Successfully unliked",
                           "likes_count": 6}
                )
            ]
        ),
        400: OpenApiResponse(
            description="Invalid action or user has already performed this action"
        ),
        500: OpenApiResponse(description="Unexpected error")
    }
)
class PostLikeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            data = request.data

            # Retrieve the post and user_family safely
            post = get_object_or_404(Post, id=data['post'])
            user_family = get_object_or_404(
                FamilyMembers,
                member=user,
                family=post.author.family
            )

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
                return Response(
                    {'details': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {'message': f'Successfully {action}',
                 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except PostLike.DoesNotExist:
            return Response(
                {'details': 'cannot like this post yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@extend_schema(tags=['Comments'])
class CommentModelViewSet(OptionalPaginationMixin, ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]
    queryset = Comment.objects.filter(is_active=True, level=0).order_by(
        '-id'
    )
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ('post',)
    model = Comment

    @extend_schema(
        summary="Create a new comment on a post",
        description="""
            Allows an authenticated user (who is a member of the family that owns the post) to create a comment.
        """,
        request=CommentCreateSerializer,
        responses={
            201: OpenApiResponse(
                response=CommentSerializer,
                description="Comment successfully created"
            ),
            400: OpenApiResponse(
                description="Invalid data or user not allowed to comment on this post"
            ),
            404: OpenApiResponse(
                description="Post or FamilyMembership not found"
            ),
        },
        examples=[
            OpenApiExample(
                name="Create comment example",
                value={
                    "post_id": 12,
                    "content": "This is a comment",
                    "reply_to": None
                },
                request_only=True
            )
        ]
    )
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

    @extend_schema(
        summary="Like or Unlike a Comment",
        description="Allows an authenticated user to like or unlike a comment within a family they belong to.",
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'comment': {'type': 'integer', 'example': 5},
                    'action': {'type': 'string',
                               'enum': ['LIKE', 'UNLIKE'],
                               'example': 'LIKE'},
                },
                'required': ['comment', 'action'],
            }
        },
        responses={
            200: OpenApiResponse(
                description="Successfully liked or unliked the comment.",
                response=OpenApiTypes.OBJECT,
                examples=[
                    OpenApiExample(
                        "Success Response",
                        value={"message": "Successfully liked",
                               "likes_count": 3},
                        status_codes=["200"],
                    )
                ],
            ),
            400: OpenApiResponse(
                description="Bad request (e.g., already liked, not yet liked, invalid action)",
                examples=[
                    OpenApiExample(
                        "Already liked",
                        value={"details": "Already liked"},
                        status_codes=["400"]
                    ),
                    OpenApiExample(
                        "Not liked yet",
                        value={"details": "Not liked yet"},
                        status_codes=["400"]
                    ),
                    OpenApiExample(
                        "Invalid action",
                        value={"details": "Invalid action"},
                        status_codes=["400"]
                    ),
                ]
            ),
            500: OpenApiResponse(description="Server error")
        }
    )
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
                return Response(
                    {'details': 'Invalid action'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response(
                {'message': f'Successfully {action}',
                 'likes_count': likes_info.counter},
                status=status.HTTP_200_OK
            )
        except CommentLike.DoesNotExist:
            return Response(
                {'details': 'cannot like this comment yet'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
