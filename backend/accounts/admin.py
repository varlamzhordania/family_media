from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, Friendship, Relation
from .helpers import send_email_verification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = (
        "id", "username", "email", "is_staff", "is_superuser", "is_active", "is_online", "email_verified",
        "date_joined",
        "last_login")
    list_filter = ("is_online", "email_verified", "is_staff", "is_active", "groups")
    readonly_fields = ("date_joined", "last_login", "last_ip")
    fieldsets = (
        (None, {"fields": ("username", "password")}),
        ("Personal Information",
         {"fields": ("first_name", "last_name", "email", "phone_number", "bio", "avatar", "bg_cover")}),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "is_active", "groups", "user_permissions")}),
        ("Security", {"fields": ("is_online", "email_verified", "date_joined", "last_login", "last_ip")}),
    )
    add_fieldsets = (
        (None, {
            "fields": (
                "username", "email", "password1", "password2",
                "groups", "is_staff", "is_active",
            )}
         ),
    )
    search_fields = ("id", "username", "email",)
    ordering = ("id",)

    actions = ["send_email_verification"]

    def send_email_verification(self, request, queryset):
        count = 0

        for user in queryset:
            if not user.email_verified:
                send_email_verification(user)
                count += 1

        self.message_user(request, "{} emails verified".format(count))

    send_email_verification.short_description = "Send email verification"


@admin.register(Friendship)
class FriendshipAdmin(admin.ModelAdmin):
    list_display = ("pk", "from_user", "to_user", "status", "created_at", "updated_at", "is_active",)
    list_filter = ("status", "created_at", "updated_at", "is_active",)


@admin.register(Relation)
class RelationAdmin(admin.ModelAdmin):
    list_display = ("pk", "user", "related", "relation", "created_at", "updated_at", "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
