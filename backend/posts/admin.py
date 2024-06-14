from django.contrib import admin
from .models import Post, PostLike, PostMedia


# Register your models here.

class PostMediaTabularInline(admin.TabularInline):
    model = PostMedia
    extra = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at', 'updated_at')
    inlines = [PostMediaTabularInline]
