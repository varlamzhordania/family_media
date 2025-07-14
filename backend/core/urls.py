"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/accounts/", include("accounts.v1.urls", namespace="v1-accounts")),
    path("api/v1/posts/", include("posts.v1.urls", namespace="v1-posts")),
    path("api/v1/events/", include("events.v1.urls", namespace="v1-events")),
    path("api/v1/chat/", include("chat.v1.urls", namespace="v1-chat")),
    path("api/v1/", include("main.v1.urls", namespace="v1-main")),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/schema/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    re_path(r'^api/auth/', include('drf_social_oauth2.urls', namespace='drf')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
