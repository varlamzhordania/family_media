from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

from .helpers import send_email_verification

User = get_user_model()


@receiver(user_logged_in, sender=User)
def update_last_ip_address(sender, request, user, **kwargs):
    user.last_ip = request.META.get('REMOTE_ADDR')
    user.save()


@receiver(post_save, sender=User)
def send_verification_email(sender, instance, created, **kwargs):
    if created and not instance.email_verified:
        try:
            send_email_verification(instance)
        except Exception as e:
            print("send_email_verification failed: ", e)
