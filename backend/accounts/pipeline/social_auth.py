from django.contrib.auth import get_user_model
from social_core.exceptions import AuthException

User = get_user_model()

def associate_by_email(strategy, details, user=None, *args, **kwargs):
    """
    If user with same email exists, link this social account to it.
    """
    if user:
        # User already authenticated via social UID
        return

    email = details.get('email')
    if not email:
        # Cannot proceed without email
        raise AuthException(strategy.backend, 'No email provided by social provider.')

    try:
        existing_user = User.objects.get(email=email)
        # Link this social account to existing user
        return {'user': existing_user}
    except User.DoesNotExist:
        # User does not exist → pipeline will continue to create a new one
        return
