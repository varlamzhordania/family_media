from .models import Family
from accounts.models import User


def have_permission(user: User, family: Family) -> bool:
    return family.members.filter(pk=user.pk).exists() and (
                family.creator == user or family.admins.filter(pk=user.pk).exists())
