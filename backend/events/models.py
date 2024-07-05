from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.management.utils import get_random_string
from django.utils import timezone
from phonenumber_field.modelfields import PhoneNumberField
from core.utils import BaseModel
from main.models import Family, FamilyMembers


# Create your models here.


class Event(BaseModel):
    family = models.ForeignKey(
        Family,
        verbose_name="Family",
        on_delete=models.CASCADE,
        related_name="events",
        blank=False,
        null=False
    )
    name = models.CharField(max_length=255, verbose_name=_("Name"), blank=False, null=False)
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True, max_length=500)
    event_date = models.DateField(verbose_name=_("Event Date"), blank=True, null=True)

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")
        ordering = ["event_date"]

    def __str__(self):
        return f"{self.id} - {self.name}"


class Invitation(BaseModel):
    family = models.ForeignKey(
        Family,
        on_delete=models.CASCADE,
        related_name="invitations",
        verbose_name=_("Family"),
        blank=False,
        null=False
    )
    invited_by = models.ForeignKey(
        FamilyMembers,
        on_delete=models.CASCADE,
        related_name='sent_invitations',
        verbose_name=_("Invited by"),
        blank=False,
        null=False
    )
    send_to_email = models.EmailField(verbose_name=_("Send To Email"), blank=True, null=True)
    send_to_phone_number = PhoneNumberField(verbose_name=_("Send To Phone Number"), blank=True, null=True)
    invitation_code = models.CharField(
        max_length=32,
        unique=True,
        verbose_name=_("Invitation Code"),
        blank=True,
        null=True,
    )
    expires_at = models.DateTimeField(verbose_name=_("Expiration Date"), blank=True, null=True)

    class Meta:
        verbose_name = _("Invitation")
        verbose_name_plural = _("Invitations")
        ordering = ["-expires_at"]

    def __str__(self):
        return f"{self.id} - {self.family.name} - {self.invitation_code}"

    def set_expire_date(self):
        hours = 2
        self.expires_at = timezone.now() + timezone.timedelta(hours=hours)
        self.save()
        return self.expires_at

    def set_invitation_code(self):
        self.invitation_code = get_random_string(32, "QWERTYUIOPASDFGHJKLZXCVBNM123456789")
        self.set_expire_date()
        self.save()
        return self.invitation_code
