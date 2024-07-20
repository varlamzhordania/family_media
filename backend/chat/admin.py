from django.contrib import admin

from .models import Room, Message, MessageMedia


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['pk', 'title', 'family', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at', 'updated_at']


class MessageMediaTabularInline(admin.TabularInline):
    model = MessageMedia
    extra = 1


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['pk', 'content', 'room', 'is_edited', 'edited_at', 'created_at', 'updated_at', ]
    inlines = [MessageMediaTabularInline]


admin.site.register(MessageMedia)
