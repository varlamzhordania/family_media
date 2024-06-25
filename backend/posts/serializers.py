from rest_framework import serializers

from main.models import FamilyMembers
from accounts.serializers import PublicUserSerializer

from .models import Post, PostMedia, PostLike, Comment, CommentLike


class AuthorSerializer(serializers.ModelSerializer):
    family = serializers.StringRelatedField()
    member = PublicUserSerializer(read_only=True)

    class Meta:
        model = FamilyMembers
        fields = ['relation', 'member', 'family', 'is_active']


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ['counter', 'users']


class PostMediaSerializer(serializers.ModelSerializer):
    ext = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PostMedia
        fields = ['is_featured', 'file', 'ext']

    def get_ext(self, obj):
        return obj.get_extension()


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):
    medias = serializers.SerializerMethodField()
    likes = serializers.SerializerMethodField()
    author = AuthorSerializer()

    class Meta:
        model = Post
        fields = '__all__'

    def get_medias(self, obj):
        queryset = obj.medias.filter(is_active=True)
        serializer = PostMediaSerializer(queryset, many=True, context=self.context)
        return serializer.data

    def get_likes(self, obj):
        try:
            queryset = obj.like_info
            serializer = PostLikeSerializer(queryset, many=False, context=self.context)
            return serializer.data
        except PostLike.DoesNotExist:
            return None


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ['counter', 'users']


class RecursiveField(serializers.Serializer):
    def to_representation(self, data):
        return CommentSerializer(data).data


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        exclude = ['lft', 'rght', 'tree_id', 'level', 'parent']


class CommentSerializer(serializers.ModelSerializer):
    children = RecursiveField(many=True, required=False)
    author = AuthorSerializer()
    likes = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        exclude = ['lft', 'rght', 'tree_id', 'level', 'parent']

    def get_likes(self, obj):
        try:
            queryset = obj.like_info
            serializer = CommentLikeSerializer(queryset, many=False, context=self.context)
            return serializer.data
        except CommentLike.DoesNotExist:
            return None
