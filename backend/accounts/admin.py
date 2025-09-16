import logging
from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin

from .models import User, Friendship, Relation
from .helpers import send_email_verification

logger = logging.getLogger(__name__)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = (
        "id", "email", "is_staff", "is_superuser", "is_active",
        "is_online", "email_verified",
        "date_joined",
        "last_login")
    list_filter = (
        "is_online", "email_verified", "is_staff", "is_active", "groups")
    readonly_fields = ("date_joined", "last_login", "last_ip")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Information",
         {"fields": (
             "first_name", "last_name", "phone_number", "bio",
             "avatar", "bg_cover")}),
        ("Permissions", {"fields": (
            "is_staff", "is_superuser", "is_active", "groups",
            "user_permissions")}),
        ("Security", {"fields": (
            "is_online", "email_verified", "date_joined", "last_login",
            "last_ip")}),
    )
    add_fieldsets = (
        (None, {
            "fields": (
                "email", "password1", "password2",
                "groups", "is_staff", "is_active",
            )}
         ),
    )
    search_fields = ("id", "username", "email",)
    ordering = ("id",)

    actions = ["send_email_verification"]

    def send_email_verification(self, request, queryset):
        count_success = 0
        count_failed = 0

        for user in queryset:
            if not user.email_verified:
                try:
                    send_email_verification(user)
                    count_success += 1
                except Exception as e:
                    count_failed += 1
                    logger.error(
                        f"Failed to send verification email to {user.email}: {e}",
                        exc_info=True
                    )

        if count_success:
            self.message_user(
                request,
                f"{count_success} verification email(s) sent successfully.",
                messages.SUCCESS
            )
        if count_failed:
            self.message_user(
                request,
                f"Failed to send {count_failed} verification email(s). Check logs for details.",
                messages.ERROR
            )

    send_email_verification.short_description = "Send email verification"


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = (
        "pk", "from_user", "to_user", "status", "created_at", "updated_at",
        "is_active",)
    list_filter = ("status", "created_at", "updated_at", "is_active",)


@admin.register(Relation)
class RelationAdmin(admin.ModelAdmin):
    list_display = (
        "pk", "user", "related", "relation", "created_at", "updated_at",
        "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
