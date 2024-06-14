from .settings import *
from oauth2_provider.settings import DEFAULTS
import os

# expires in 6 months
DEFAULTS['ACCESS_TOKEN_EXPIRE_SECONDS'] = 1.577e7
FILE_UPLOAD_MAX_MEMORY_SIZE = 200 * 1024 * 1024  # 200 Mb limit

ALLOWED_HOSTS = ["*"]

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

BASE_DOMAIN = os.getenv("BASE_DOMAIN", 'http://127.0.0.1:8000')

STATICFILES_DIRS = [
    BASE_DIR / "static"
]

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = os.getenv("EMAIL_PORT")
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS")
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_password")
