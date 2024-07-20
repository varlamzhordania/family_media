from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.db import transaction
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from main.models import Family, FamilyMembers

from .models import Room, Message
from .serializers import MessageSerializer
from .consumers import ChatConsumer


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
    if action == 'post_add':
        user_ids = kwargs.get('pk_set', [])
        users = get_user_model().objects.filter(id__in=user_ids)
        for user in users:
            try:
                room = Room.objects.get(family=instance)
                room.participants.add(user)
            except Room.DoesNotExist:
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


def send_layer_signal(channel_layer, channel_name, action, serializer):
    message = {"action": action, "data": serializer}
    async_to_sync(channel_layer.group_send)(channel_name, {'type': 'broadcast_message', 'message': message})
    async_to_sync(channel_layer.group_send)(channel_name, {'type': 'send_notification', 'message': message})
    return True


@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    serializer = ChatConsumer.get_serializer_data_to_dict(None, MessageSerializer(instance))
    if created:
        action = "new_message"
        channel_layer = get_channel_layer()
        channel_name = f"private_chat_{instance.room.id}"
        transaction.on_commit(lambda: send_layer_signal(channel_layer, channel_name, action, serializer))
