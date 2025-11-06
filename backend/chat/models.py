import os

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from core.utils import BaseModel, UploadPath
from core.validators import FileExtensionValidator, ValidateFileSize
from main.models import Family


class Room(BaseModel):
    class TypeChoices(models.TextChoices):
        PRIVATE = 'private', _('Private room')
        GROUP = 'group', _('Group room')
        FAMILY = 'family', _('Family room')

    type = models.CharField(
        verbose_name=_('Room Type'),
        max_length=10,
        choices=TypeChoices.choices,
        default=TypeChoices.PRIVATE,
    )
    title = models.CharField(
        verbose_name=_('Title'),
        max_length=255,
        blank=True,
        null=True
    )
    description = models.TextField(
        verbose_name=_('Description'),
        blank=True,
        null=True
    )
    family = models.ForeignKey(
        Family,
        verbose_name=_("Family"),
        on_delete=models.CASCADE,
        related_name='chat_room',
        null=True,
        blank=True
    )

    participants = models.ManyToManyField(
        get_user_model(),
        verbose_name=_('Participants'),
        related_name='participants'
    )
    avatar = models.ImageField(
        verbose_name=_('Avatar'),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True
    )
    created_by = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Created By"),
        related_name="created_rooms",
        on_delete=models.SET_NULL,
        null=True
    )
    is_archived = models.BooleanField(
        verbose_name=_('Is Archived'),
        default=False
    )

    def __str__(self):
        return self.title if self.title else f'Room {self.id}'

    def latest_message(self):
        return self.messages.order_by('-created_at').first()


class VideoCall(BaseModel):
    class StatusChoices(models.TextChoices):
        ONGOING = "ongoing", _("Ongoing")
        ENDED = "ended", _("Ended")

    room = models.OneToOneField(
        Room,
        verbose_name=_("Room"),
        related_name="video_call",
        on_delete=models.CASCADE
    )

    creator = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Host"),
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="hosted_calls"
    )

    participants = models.ManyToManyField(
        get_user_model(),
        verbose_name=_("Participants"),
        blank=True,
        related_name="video_calls"
    )

    status = models.CharField(
        verbose_name=_("Status"),
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.ONGOING
    )

    started_at = models.DateTimeField(
        verbose_name=_("Date Start"),
        auto_now_add=True
    )
    ended_at = models.DateTimeField(
        verbose_name=_("Date End"),
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"VideoCall in {self.room.title or self.room.id} ({self.status})"

    def mark_started(self):
        from django.utils import timezone

        self.started_at = timezone.now()
        self.status = self.StatusChoices.ONGOING
        self.save(update_fields=['status', 'started_at'])

    def mark_status(self, status):
        self.status = status
        self.save(update_fields=['status'])

    def mark_end(self):
        from django.utils import timezone

        self.status = self.StatusChoices.ENDED
        self.ended_at = timezone.now()
        self.save(update_fields=['status', 'ended_at'])


class Message(BaseModel):
    user = models.ForeignKey(
        get_user_model(),
        verbose_name=_("User"),
        related_name="messages",
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    room = models.ForeignKey(
        Room,
        verbose_name=_("Room"),
        on_delete=models.CASCADE,
        related_name='messages',
        blank=True,
        null=False
    )
    content = models.TextField(
        verbose_name=_('Message content'),
        blank=True,
        null=False
    )
    have_read = models.ManyToManyField(
        get_user_model(),
        verbose_name=_('Have Read'),
        blank=True,
    )
    is_edited = models.BooleanField(
        verbose_name=_('Is Edited'),
        default=False
    )
    edited_at = models.DateTimeField(
        verbose_name=_('Edited At'),
        blank=True,
        null=True
    )

    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        verbose_name=_("Reply To"),
        null=True,
        blank=True,
        related_name='replies'
    )

    class Meta:
        verbose_name = _("Message")
        verbose_name_plural = _("Messages")
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.room}: {self.content}'


class MessageMedia(BaseModel):
    message = models.ForeignKey(
        Message,
        verbose_name=_("Message"),
        on_delete=models.SET_NULL,
        related_name="medias",
        blank=True,
        null=True
    )
    file = models.FileField(
        upload_to=UploadPath(folder="chat", sub_path="media"),
        validators=[
            FileExtensionValidator(
                allowed_extensions=[
                    'jpg', 'jpeg', 'pjpeg', 'png', 'webp', 'gif', 'bmp',
                    'tiff', 'tif', 'svg', 'heif', 'heic',
                    # Image formats
                    'mp4', 'webm', 'avi', 'mkv', 'mpeg', 'mpg', 'mov',
                    'wmv', 'flv', '3gp', 'm4v',  # Video formats
                    'mp3', 'wav', 'ogg', 'flac',  # Audio formats
                    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
                    'txt', 'rtf', 'csv',  # Document formats
                    # 'zip', 'rar', '7z', 'gz', 'tar',  # Archive formats
                ]
            ),
            ValidateFileSize(allowed_file_size=50)
        ]
    )
    size = models.PositiveIntegerField(
        default=0,
        verbose_name=_("File Size"), )

    class Meta:
        verbose_name = _("Message media")
        verbose_name_plural = _("Message medias")
        ordering = ('created_at',)

    def __str__(self):
        return f"{self.id} - {self.message}"

    def save(self, *args, **kwargs):
        if self.file and not self.size:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def get_extension(self):
        return os.path.splitext(self.file.name)[1]


class IceServer(BaseModel):
    class TypeChoices(models.TextChoices):
        STUN = "stun", _("STUN Server")
        TURN = "turn", _("TURN Server")

    type = models.CharField(
        verbose_name=_("Server Type"),
        max_length=10,
        choices=TypeChoices.choices,
        default=TypeChoices.STUN,
    )

    urls = models.JSONField(
        verbose_name=_("URLs"),
        help_text=_(
            "List of STUN/TURN URLs (e.g. ['stun:stun.l.google.com:19302'])"
            )
    )

    username = models.CharField(
        verbose_name=_("Username"),
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Only required for TURN servers")
    )

    credential = models.CharField(
        verbose_name=_("Credential"),
        max_length=255,
        blank=True,
        null=True,
        help_text=_("Only required for TURN servers")
    )
    priority = models.PositiveSmallIntegerField(
        verbose_name=_("Priority"),
        default=0,
        db_index=True,
        help_text=_("Lower numbers are used first in connection attempts."),
    )

    region = models.CharField(
        verbose_name=_("Region"),
        max_length=50,
        blank=True,
        null=True,
        db_index=True,
        help_text=_("Optional region label for distributed TURN/STUN servers."),
    )

    class Meta:
        verbose_name = _("ICE Server")
        verbose_name_plural = _("ICE Servers")
        ordering = ["priority", "type"]
        indexes = [
            models.Index(fields=["type", "is_active"]),
            models.Index(fields=["region"]),
        ]


    def __str__(self):
        return f"{self.type.upper()} - {self.urls[0] if self.urls else 'No URL'}"

    def as_dict(self):
        """Return this ICE server in WebRTC-compatible format."""
        data = {"urls": self.urls}
        if self.username:
            data["username"] = self.username
        if self.credential:
            data["credential"] = self.credential
        return data
