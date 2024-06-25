from rest_framework import permissions
from rest_framework.exceptions import PermissionDenied
from rest_framework.request import Request
from rest_framework.views import APIView
from typing import Any, Type
from django.db.models import Model
from main.models import FamilyMembers


class FamilyAccess(permissions.BasePermission):
    """
    Object-level permission to only allow family member of an object to access it.
    """
    message = 'Only Family members are allowed to access this.'

    def has_permission(self, request: Request, view: APIView):
        if not bool(request.user and request.user.is_authenticated):
            return False

        model: Type[Model] = view.model
        # Extract fields for lookup

        if view.queryset.exists():
            obj = view.queryset.first()
        else:
            obj = model.objects.none()

        family = obj.get_family()

        # Get all families the user is a member of
        user_families = FamilyMembers.objects.filter(member=request.user).values_list('family', flat=True)
        # Check if the object's family is in the user's families
        return family.id in user_families
