"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os
import django

from core.settings.settings import DEBUG

if DEBUG:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.development')
    print("Manage: Django loaded up in setting mode : Development")
else:
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.production')
    print("Manage: Django loaded up in setting mode : Production")

django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter
from channels.auth import AuthMiddlewareStack, BaseMiddleware
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator

from core.middleware import JwtAuthMiddlewareStack

from chat.routing import urlpatterns as chat_patterns
from accounts.routing import urlpatterns as account_patterns

urlpatterns = []
urlpatterns += chat_patterns
urlpatterns += account_patterns

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": AllowedHostsOriginValidator(
            JwtAuthMiddlewareStack(
                URLRouter(
                    urlpatterns
                )
            )
        ),
    }
)
