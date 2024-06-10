from django.core.validators import MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from core.utils import UploadPath


# Create your models here.

class User(AbstractUser):
    email = models.EmailField(_("email address"), blank=True, unique=True)
    avatar = models.ImageField(
        verbose_name=_("Avatar"),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True,
        default="img/default-avatar.jpg",
    )
    phone_number = PhoneNumberField(blank=True, null=True, verbose_name=_("Phone Number"))
    last_ip = models.GenericIPAddressField(verbose_name=_("Last IP Address"), null=True, blank=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username

    @property
    def get_full_name(self):
        if not self.first_name and not self.last_name:
            return self.username
        return f"{self.first_name} {self.last_name}"

    @property
    def get_initials_name(self):
        if not self.first_name or not self.last_name:
            return self.username[0:2]
        return f"{self.first_name[0]}{self.last_name[0]}"
