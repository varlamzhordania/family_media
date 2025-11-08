import logging
from django.conf import settings
from django.core.mail import send_mail, get_connection
from django.urls import reverse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from smtplib import SMTPException

from .meta import absolute_url
from .models import User
from .tokens import email_verification_token

logger = logging.getLogger(__name__)


def send_email_verification(instance: User):
    """
    Send a verification email. Falls back to secondary backend if SMTP fails.
    """
    token = email_verification_token.make_token(instance)
    uidb64 = urlsafe_base64_encode(force_bytes(instance.pk))
    verification_url = reverse('v1-accounts:verify_email', kwargs={'uidb64': uidb64, 'token': token})
    verification_link = absolute_url(verification_url)
    subject = 'Verify your email address'
    message = f'Click the link to verify your email: {verification_link}'

    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [instance.email])
        logger.info(f"Verification email sent to {instance.email}")
    except Exception as e:
        logger.error(f"Primary email send failed for {instance.email}: {e}")
        _send_mail_fallback(subject, message, instance.email)


def send_password_reset_email(instance: User):
    """
    Send password reset email. Falls back to secondary backend if SMTP fails.
    """
    token = PasswordResetTokenGenerator().make_token(instance)
    uid = urlsafe_base64_encode(force_bytes(instance.pk))
    reset_link = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}/"

    subject = "Password Reset Request"
    message = f"Click the link to reset your password: {reset_link}"

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[instance.email],
        )
        logger.info(f"Password reset email sent to {instance.email}")
    except Exception as e:
        logger.error(f"Primary email send failed for {instance.email}: {e}")
        _send_mail_fallback(subject, message, instance.email)


def _send_mail_fallback(subject: str, message: str, recipient: str):
    """
    Fallback mail sender that uses a secondary backend (e.g., Gmail, console).
    Configure it in settings as EMAIL_FALLBACK_BACKEND or EMAIL_FALLBACK_CREDENTIALS.
    """
    try:
        # Example: use alternate SMTP credentials (like Gmail) if provided
        alt_backend = getattr(settings, "EMAIL_FALLBACK_BACKEND", None)
        alt_user = getattr(settings, "EMAIL_FALLBACK_USER", None)
        alt_pass = getattr(settings, "EMAIL_FALLBACK_PASSWORD", None)
        alt_host = getattr(settings, "EMAIL_FALLBACK_HOST", None)
        alt_port = getattr(settings, "EMAIL_FALLBACK_PORT", 587)

        if alt_backend:
            # Use a secondary backend (e.g., console or file)
            connection = get_connection(backend=alt_backend)
        elif alt_host and alt_user and alt_pass:
            # Create a temporary SMTP connection using alternate credentials
            connection = get_connection(
                host=alt_host,
                port=alt_port,
                username=alt_user,
                password=alt_pass,
                use_tls=True,
            )
        else:
            # If no fallback defined, just log it
            logger.warning(f"No fallback backend configured for {recipient}.")
            return

        connection.send_messages([
            connection.create_message(
                subject=subject,
                body=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient],
            )
        ])
        logger.info(f"Fallback email sent successfully to {recipient}")
    except SMTPException as e:
        logger.critical(f"Fallback SMTP failed for {recipient}: {e}")
    except Exception as e:
        logger.critical(f"Unexpected fallback mail error for {recipient}: {e}")
