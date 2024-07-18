from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from main.models import Family, FamilyMembers
from .models import Room


@receiver(post_save, sender=Family)
def create_or_update_family_room(sender, instance, created, **kwargs):
    participants = instance.members.all()
    room, _ = Room.objects.update_or_create(
        family=instance,
        defaults={
            'type': Room.TypeChoices.FAMILY,
            'title': instance.name,
            'created_by': instance.creator,
        }
    )
    room.participants.set(participants)


@receiver(m2m_changed, sender=Family.members.through)
def update_room_participants(sender, instance, action, **kwargs):
    print("triggered")
    if action == 'post_add':
        user_ids = kwargs.get('pk_set', [])
        users = get_user_model().objects.filter(id__in=user_ids)
        for user in users:
            try:
                room = Room.objects.get(family=instance)
                room.participants.add(user)
            except Room.DoesNotExist:
                print("room doesn't exist")
                pass  # Handle case where room doesn't exist


@receiver(post_delete, sender=Family)
def delete_family_room(sender, instance, **kwargs):
    try:
        room = Room.objects.get(family=instance)
        room.delete()
    except Room.DoesNotExist:
        pass  # Handle case where room doesn't exist


@receiver(post_delete, sender=FamilyMembers)
def delete_family_member(sender, instance, **kwargs):
    try:
        room = Room.objects.get(family=instance.family)
        room.participants.remove(instance.member)
    except Room.DoesNotExist:
        pass  # Handle case where room doesn't exist
    except FamilyMembers.DoesNotExist:
        pass  # Handle case where family member doesn't exist
