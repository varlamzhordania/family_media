from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from .models import Family, FamilyMembers, FamilyTree


# Register your models here.


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ("pk", "creator", "name", "created_at", "updated_at", "is_active", "invite_code")
    list_filter = ("created_at", "updated_at", "is_active",)
    search_fields = ("pk", "name")

    def set_invite_code(self, request, queryset):
        for family in queryset:
            family.set_invite_code()
        self.message_user(request, "Invite codes successfully generated for selected families.")

    set_invite_code.short_description = "Generate Invite Codes"

    actions = [set_invite_code]


@admin.register(FamilyTree)
class FamilyTreeAdmin(MPTTModelAdmin, admin.ModelAdmin):
    list_display = ("pk", "family", "name", "date_of_birth", "date_of_death")
    list_filter = ("date_of_birth", "date_of_birth")
    search_fields = ("pk", "name")


@admin.register(FamilyMembers)
class FamilyMembersAdmin(admin.ModelAdmin):
    list_display = ("pk", "member", "family", "relation", "created_at", "updated_at", "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
    search_fields = ("pk", "family")

