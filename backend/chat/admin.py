from django.contrib import admin

from .models import Room, VideoCall, Message, MessageMedia, IceServer


@admin.register(VideoCall)
class VideoCallAdmin(admin.ModelAdmin):
    list_display = ['pk', 'room__title', 'status', 'started_at',
                    'ended_at', 'is_active']
    list_filter = ['status', 'started_at', 'ended_at', 'is_active']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['pk', 'title', 'family', 'is_active', 'created_at',
                    'updated_at']
    list_filter = ['is_active', 'created_at', 'updated_at']


class MessageMediaTabularInline(admin.TabularInline):
    model = MessageMedia
    extra = 1


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['pk', 'content', 'room', 'is_edited', 'edited_at',
                    'created_at', 'updated_at', ]
    inlines = [MessageMediaTabularInline]


admin.site.register(MessageMedia)


@admin.register(IceServer)
class IceServerAdmin(admin.ModelAdmin):
    list_display = (
        "type", "urls", "region", "is_active", "priority", "is_active",
        "created_at", "updated_at")
    list_filter = (
        "type", "is_active", "region", "created_at", "updated_at")
    search_fields = ("urls", "region")
    ordering = ("priority",)
