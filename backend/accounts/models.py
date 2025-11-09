import uuid

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

        if not extra_fields.get("username"):
            base_username = email.split('@')[0]
            username = f"{base_username}_{uuid.uuid4().hex[:6]}"
            extra_fields["username"] = username

        user = self.model(email=email, **extra_fields)  # remove username=email
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
    is_online = models.BooleanField(verbose_name=_("Online"), default=False)
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

    def send_friend_request(self, to_user):
        if self != to_user:
            friendship, created = Friendship.objects.get_or_create(
                from_user=self,
                to_user=to_user,
                status=Friendship.StatusChoices.REQUESTED,
                defaults={'status': Friendship.StatusChoices.REQUESTED}
            )
            return created
        return False

    def accept_friend_request(self, from_user):
        try:
            friendship = Friendship.objects.get(
                from_user=from_user,
                to_user=self,
                status=Friendship.StatusChoices.REQUESTED
            )
            friendship.status = Friendship.StatusChoices.ACCEPTED
            friendship.save()
            return True
        except Friendship.DoesNotExist:
            return False

    def decline_friend_request(self, from_user):
        try:
            friendship = Friendship.objects.get(
                from_user=from_user,
                to_user=self,
                status=Friendship.StatusChoices.REQUESTED
            )
            friendship.status = Friendship.StatusChoices.DECLINED
            friendship.is_active = False
            friendship.save()
            return True
        except Friendship.DoesNotExist:
            return False

    def remove_friend(self, friend_user):
        Friendship.objects.filter(
            (models.Q(from_user=self, to_user=friend_user) | models.Q(from_user=friend_user, to_user=self)),
            status=Friendship.StatusChoices.ACCEPTED
        ).delete()

    def get_friend_requests_received(self):
        return Friendship.objects.filter(to_user=self, status=Friendship.StatusChoices.REQUESTED)

    def get_friends(self):
        return User.objects.filter(
            models.Q(
                friendships_sent__to_user=self,
                friendships_sent__status=Friendship.StatusChoices.ACCEPTED,
                friendships_sent__is_active=True
                ) |
            models.Q(
                friendships_received__from_user=self,
                friendships_received__status=Friendship.StatusChoices.ACCEPTED,
                friendships_received__is_active=True,
            )
        ).distinct()


class Friendship(BaseModel):
    class StatusChoices(models.TextChoices):
        REQUESTED = 'requested', _("Requested")
        ACCEPTED = 'accepted', _("Accepted")
        DECLINED = 'declined', _("Declined")

    from_user = models.ForeignKey(User, related_name='friendships_sent', on_delete=models.CASCADE)
    to_user = models.ForeignKey(User, related_name='friendships_received', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=StatusChoices.choices, default=StatusChoices.REQUESTED)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['from_user', 'to_user'],
                name='unique_friendship',
                condition=models.Q(status='requested')
            )
        ]

    def __str__(self):
        return f"{self.from_user.get_full_name} -> {self.to_user.get_full_name} ({self.status})"


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
