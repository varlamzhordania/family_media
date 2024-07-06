from django.core.validators import MinValueValidator
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField

from core.utils import UploadPath, BaseModel
from core.validators import ValidateFileSize


# Create your models here.
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email field must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    email = models.EmailField(_("email address"), blank=True, unique=True)
    avatar = models.ImageField(
        verbose_name=_("Avatar"),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True,
        validators=[ValidateFileSize(allowed_file_size=32)]
    )
    bg_cover = models.ImageField(
        verbose_name=_("Background Cover"),
        upload_to=UploadPath(folder="pictures", sub_path="covers"),
        validators=[ValidateFileSize(allowed_file_size=128)],
        blank=True,
        null=True,
    )
    bio = models.TextField(verbose_name=_("Bio"), blank=True, null=True)
    phone_number = PhoneNumberField(blank=True, null=True, verbose_name=_("Phone Number"))
    last_ip = models.GenericIPAddressField(verbose_name=_("Last IP Address"), null=True, blank=True)
    email_verified = models.BooleanField(verbose_name=_("Email verified"), default=False)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

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


class Relation(BaseModel):
    user = models.ForeignKey(
        User,
        verbose_name=_("Me"),
        on_delete=models.CASCADE,
        related_name='relations',
        blank=False,
        null=False,
    )
    related = models.ForeignKey(
        User,
        verbose_name=_("Related Person"),
        on_delete=models.CASCADE,
        related_name='relaters',
        blank=False,
        null=False,
    )
    relation = models.CharField(
        max_length=64,
        verbose_name=_("Relation"),
        blank=True,
        null=True,
        default=_("Unknown"),
    )

    class Meta:
        verbose_name = _("Relation")
        verbose_name_plural = _("Relations")
        unique_together = ('user', 'related')

    def __str__(self):
        return f"{self.user} - {self.relation} ({self.relation})"
