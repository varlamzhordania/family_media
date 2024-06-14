from rest_framework.generics import ListAPIView, CreateAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from django.db import transaction

from main.models import FamilyMembers

from .models import Post, PostMedia
from .serializers import PostCreateSerializer, PostSerializer, PostMediaSerializer


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
