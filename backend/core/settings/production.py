import os
from oauth2_provider.settings import DEFAULTS
from .settings import *

ALLOWED_HOSTS = ["*"]

DEFAULTS['ACCESS_TOKEN_EXPIRE_SECONDS'] = 1.577e7
FILE_UPLOAD_MAX_MEMORY_SIZE = 200 * 1024 * 1024  # 200 Mb limit

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

BASE_DOMAIN = os.getenv("BASE_DOMAIN", 'http://127.0.0.1:8000')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static"),
]

CACHES = {
    'default': {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        'LOCATION': os.getenv("REDIS_HOST"),
    }
}

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [(os.getenv("REDIS_HOST"), 6379)],
        },
    },
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", 'Family Media')
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = os.getenv("EMAIL_PORT")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD")

USE_HTTPS_IN_ABSOLUTE_URLS = os.getenv("USE_HTTPS_IN_ABSOLUTE_URLS", True)
