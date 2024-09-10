from django.contrib import admin
from .models import Event, Invitation


# Register your models here.


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("pk", "family", "name", "event_date", "created_at", "updated_at", "is_active",)
    list_filter = ("event_date", "created_at", "updated_at", "is_active",)
    search_fields = ("name",)


@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = (
        "pk", "family", "invited_by", "service", "target", "expires_at", "created_at", "updated_at", "is_active",
    )
    list_filter = ("expires_at", "created_at", "updated_at", "is_active",)
    search_fields = ("target", "invitation_code",)
