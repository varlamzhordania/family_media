from typing import Tuple, Type, List, Any
from django.contrib import admin
from .models import Post, PostLike, PostMedia, Comment, CommentLike
from mptt.admin import MPTTModelAdmin


# Register your models here.

@admin.register(Comment)
class CommentAdmin(MPTTModelAdmin, admin.ModelAdmin):
    list_display: Tuple[str, ...] = ('id', 'post_id', 'author_user')
    list_filter: Tuple[str, ...] = ('is_active', 'created_at', 'updated_at')

    def author_user(self, obj: Type[Comment]) -> str:
        return obj.author.member


class PostMediaTabularInline(admin.TabularInline):
    model: Type[PostMedia] = PostMedia
    extra: int = 1


class PostLikesStackedInline(admin.StackedInline):
    model: Type[PostLike] = PostLike
    extra: int = 1
    min_num: int = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display: Tuple[str, ...] = ('id', 'author', 'is_active', 'created_at', 'updated_at')
    list_filter: Tuple[str, ...] = ('is_active', 'created_at', 'updated_at')
    inlines: List[Any] = [PostMediaTabularInline, PostLikesStackedInline]


admin.site.register(PostLike)
