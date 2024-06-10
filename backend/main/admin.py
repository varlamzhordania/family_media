from django.contrib import admin
from .models import Family, FamilyMembers, FamilyRelation


# Register your models here.


@admin.register(Family)
class FamilyAdmin(admin.ModelAdmin):
    list_display = ("pk", "creator", "name", "created_at", "updated_at", "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
    search_fields = ("pk", "name")


@admin.register(FamilyMembers)
class FamilyMembersAdmin(admin.ModelAdmin):
    list_display = ("pk", "member", "family", "relation", "created_at", "updated_at", "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
    search_fields = ("pk", "family")


@admin.register(FamilyRelation)
class FamilyRelationAdmin(admin.ModelAdmin):
    list_display = ("pk", "from_member", "to_member", "relation", "created_at", "updated_at", "is_active",)
    list_filter = ("created_at", "updated_at", "is_active",)
