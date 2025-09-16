import uuid
import environ

from django.utils.translation import gettext_lazy as _
from pathlib import Path
from oauth2_provider.settings import DEFAULTS

from core.ckeditor import BASE_CKEDITOR_5_CONFIGS

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()

development_env_path = BASE_DIR / "development.env"
docker_env_path = BASE_DIR.parent / ".env"

env_file_path = development_env_path if development_env_path.exists() else docker_env_path

environ.Env.read_env(env_file=env_file_path)

SECRET_KEY = env('DJANGO_SECRET_KEY', default=str(uuid.uuid4()))

DEBUG = env.bool('DJANGO_DEBUG', default=True)

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['*'])

INSTALLED_APPS = [
    "daphne",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    'django.contrib.sites',
    # Inner applications
    "accounts.apps.AccountsConfig",
    "main.apps.MainConfig",
    "events.apps.EventsConfig",
    "posts.apps.PostsConfig",
    "chat.apps.ChatConfig",
    # Third party packages
    "rest_framework",
    'django_filters',
    "drf_spectacular",
    'oauth2_provider',
    'social_django',
    'drf_social_oauth2',
    "corsheaders",
    'mptt',

]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"
ASGI_APPLICATION = "core.asgi.application"

DB_ENGINE = env.str("DB_ENGINE", default="sqlite3").lower().strip()

if DB_ENGINE == "postgresql":
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': env('DB_NAME', default='mydatabase'),
            'USER': env('DB_USER', default='myuser'),
            'PASSWORD': env('DB_PASSWORD', default='mypassword'),
            'HOST': env('DB_HOST', default='localhost'),
            'PORT': env('DB_PORT', default='5432'),
        }
    }
elif DB_ENGINE == "mysql":
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': env("DB_NAME", default='mydatabase'),
            'USER': env("DB_USER", default='myuser'),
            'PASSWORD': env("DB_PASSWORD", default='mypassword'),
            'HOST': env("DB_HOST", default='localhost'),
            'PORT': env("DB_PORT", default='3306'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

LANGUAGES = (
    ('en', _('English')),
    ('fr', _('French')),
    ('es', _('Spanish')),
    ('ar', _('Arabic')),
)

PARLER_LANGUAGES = {
    None: (
        {'code': 'en', },  # English
        {'code': 'fr', },  # French
        {'code': 'es', },  # Spanish
        {'code': 'ar', },  # Arabic
    ),
    'default': {
        'fallback': 'en',  # defaults to PARLER_DEFAULT_LANGUAGE_CODE
        'hide_untranslated': False,
        # the default; let .active_translations() return fallbacks too.
    }
}

LOCALE_PATHS = [
    BASE_DIR / 'locale/',
]

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

STATICFILES_DIRS = [
    BASE_DIR / 'static'
]

# Uncomment if using ckeditor
# CKEDITOR_BASEPATH = "/static/ckeditor/ckeditor/"
# CKEDITOR_UPLOAD_PATH = "uploads/"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
AUTH_USER_MODEL = 'accounts.User'

# Google configuration
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env.str("SOCIAL_AUTH_GOOGLE_OAUTH2_KEY")
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env.str(
    "SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET"
    )

# Facebook configuration
SOCIAL_AUTH_FACEBOOK_OAUTH2_KEY = env.str(
    "SOCIAL_AUTH_FACEBOOK_OAUTH2_KEY"
    )
SOCIAL_AUTH_FACEBOOK_OAUTH2_SECRET = env.str(
    "SOCIAL_AUTH_FACEBOOK_OAUTH2_SECRET"
    )

# Define SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE to get extra permissions from Google.
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
]

AUTHENTICATION_BACKENDS = [

    'accounts.backends.EmailBackend',

    # Google  OAuth2
    'social_core.backends.google.GoogleOAuth2',

    'drf_social_oauth2.backends.DjangoOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

ACTIVATE_JWT = True

REST_FRAMEWORK = {
    # YOUR SETTINGS
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        # django-oauth-toolkit >= 1.0.0
        'drf_social_oauth2.authentication.SocialAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 25
}

# optional: auto-create users
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'accounts.pipelines.associate_by_email'
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

SPECTACULAR_SETTINGS = {
    'TITLE': 'Family Media API',
    'DESCRIPTION': '',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    # OTHER SETTINGS
}

if DEBUG:
    CHANNEL_LAYERS = {
        'default': {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        },
    }
else:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                "hosts": [
                    env('REDIS_HOST', default='redis://localhost:6379')],
                "capacity": 1000,
                # 🔹 Increase buffer size to allow more messages
                "expiry": 10,
                # 🔹 Reduce expiry to clear old messages faster
            },
        },
    }

USE_HTTPS_IN_ABSOLUTE_URLS = env.bool(
    "USE_HTTPS_IN_ABSOLUTE_URLS",
    default=False
)
SERVER_DOMAIN = env("BACKEND_DOMAIN", default="http://127.0.0.1:8000")
# eg. react,svelte...etc
FRONTEND_DOMAIN = env("FRONTEND_DOMAIN", default="http://localhost:5173")

BASE_DOMAIN = FRONTEND_DOMAIN
FRONTEND_URL = FRONTEND_DOMAIN

if DEBUG:
    CORS_ALLOWED_ORIGINS = [SERVER_DOMAIN, FRONTEND_DOMAIN]
else:
    CORS_ALLOWED_ORIGINS = [f"https://{FRONTEND_DOMAIN}"]

if not DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
            'LOCATION': env('MEMCACHE_HOST', default='127.0.0.1:11211'),
            # "BACKEND": "django.core.cache.backends.redis.RedisCache",
            # 'LOCATION': env("REDIS_HOST"),  # Use the REDIS_HOST environment variable
        }

    }
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    # expires in 6 months
    # DEFAULTS['ACCESS_TOKEN_EXPIRE_SECONDS'] = 1.577e7
    FILE_UPLOAD_MAX_MEMORY_SIZE = 1024 * 1024 * 1024 * 2  # 2 GB limit

else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    DEFAULTS['ACCESS_TOKEN_EXPIRE_SECONDS'] = 1.577e7
    FILE_UPLOAD_MAX_MEMORY_SIZE = 200 * 1024 * 1024  # 200 Mb limit

EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env("EMAIL_PORT", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_password", default="")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default='Family Media')

# Uncomment if Using RabbitMQ
# RABBITMQ_HOST = env("RABBITMQ_HOST", default="")
# RABBITMQ_PORT = env("RABBITMQ_PORT", default="")
# RABBITMQ_USER = env("RABBITMQ_USER", default="")
# RABBITMQ_PASSWORD = env("RABBITMQ_PASSWORD", default="")
# RABBITMQ_QUEUE_NAME = env("RABBITMQ_QUEUE_NAME", default="")
# RABBITMQ_VHOST = env("RABBITMQ_VHOST", default="")


CELERY_BROKER_URL = 'redis://redis:6379/0'
CELERY_RESULT_BACKEND = 'redis://redis:6379/1'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
# CELERY_TASK_TIME_LIMIT = 300  # Task time limit in seconds
CELERY_TASK_RETRY = True
CELERY_TASK_DEFAULT_RETRY_DELAY = 60
CELERY_TASK_MAX_RETRIES = 3
CELERY_TIMEZONE = 'UTC'
CELERY_BEAT_SCHEDULE = {
    # Example: 'task_name': {'task': 'task_path', 'schedule': 'interval_or_cron'}
}

CKEDITOR_5_CONFIGS = BASE_CKEDITOR_5_CONFIGS
PHONENUMBER_DEFAULT_FORMAT = "INTERNATIONAL"

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['file', 'console'],
        'level': 'DEBUG',
    },
}

if not DEBUG:
    LOGGING['handlers'] = {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'error.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    }

SITE_ID = 1
STATIC_VERSION = "1"
