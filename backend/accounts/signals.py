from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from settings.models import Notification

User = get_user_model()


@receiver(user_logged_in, sender=User)
def update_last_ip_address(sender, request, user, **kwargs):
    user.last_ip = request.META.get('REMOTE_ADDR')
    user.save()


@receiver(post_save, sender=User)
def create_welcome_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance,
            message="Welcome to Global Cell",
            status=Notification.StatusChoices.INFO,
            priority=Notification.PriorityChoices.LOW,
        )
