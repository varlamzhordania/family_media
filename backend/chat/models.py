from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

from core.utils import BaseModel, UploadPath
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

    participants = models.ManyToManyField(get_user_model(), verbose_name=_('Participants'), related_name='participants')
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
    content = models.TextField(verbose_name=_('Message content'), blank=True, null=False)
    have_read = models.ManyToManyField(
        get_user_model(),
        verbose_name=_('Have Read'),
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
