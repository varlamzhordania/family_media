from django.conf import settings
from django.core.mail import send_mail
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator

from .meta import absolute_url
from .models import User
from .tokens import email_verification_token


def send_email_verification(instance: User):
    token = email_verification_token.make_token(instance)
    uidb64 = urlsafe_base64_encode(force_bytes(instance.pk))
    verification_url = reverse('v1-accounts:verify_email', kwargs={'uidb64': uidb64, 'token': token})
    verification_link = absolute_url(verification_url)
    subject = 'Verify your email address'
    message = f'Click the link to verify your email: {verification_link}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.email])


def send_password_reset_email(instance: User):
    token = PasswordResetTokenGenerator().make_token(instance)
    uid = urlsafe_base64_encode(force_bytes(instance.pk))
    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"
    send_mail(
        subject="Password Reset Request",
        message=f"Click the link to reset your password: {reset_link}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[instance.email]
    )
