from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from core.utils import UploadPath, BaseModel
from django.core.management.utils import get_random_string


# Create your models here.


class Family(BaseModel):
    creator = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Creator"),
        on_delete=models.CASCADE,
        related_name="my_families_ct",
        blank=False,
        null=False,
    )
    name = models.CharField(_("Name"), max_length=64, blank=False, null=False)
    avatar = models.ImageField(
        verbose_name=_("Avatar"),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True,
        default="img/default-avatar.jpg",
    )
    members = models.ManyToManyField(
        get_user_model(),
        verbose_name=_("Members"),
        related_name="my_families",
        through="FamilyMembers",
    )
    admins = models.ManyToManyField(
        get_user_model(),
        verbose_name=_("Administrators"),
        blank=True,
        related_name="my_roles"
    )
    invite_code = models.CharField(
        max_length=10,
        unique=True,
        blank=True,
        null=True,
        default=get_random_string(10, "QWERTYUIOPASDFGHJKLZXCVBNM123456789")
    )

    class Meta:
        verbose_name = _("Family")
        verbose_name_plural = _("Families")
        ordering = ["name"]

    def __str__(self):
        return f"{self.id} - {self.name}"

    def set_new_invite_code(self):
        self.invite_code = get_random_string(10, "QWERTYUIOPASDFGHJKLZXCVBNM123456789")
        return self.save()


class FamilyMembers(BaseModel):
    member = models.ForeignKey(
        get_user_model(),
        verbose_name=_("Member"),
        on_delete=models.CASCADE,
        related_name="my_memberships",
        blank=False,
        null=False,
    )
    family = models.ForeignKey(
        Family,
        verbose_name=_("Family"),
        on_delete=models.CASCADE,
        related_name="my_members",
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
        verbose_name = _("Family Member")
        verbose_name_plural = _("Family Members")
        unique_together = ('member', 'family')


class FamilyRelation(BaseModel):
    from_member = models.ForeignKey(
        FamilyMembers,
        verbose_name=_("Who am i"),
        on_delete=models.CASCADE,
        related_name='from_relations',
        blank=False,
        null=False,
    )
    to_member = models.ForeignKey(
        FamilyMembers,
        verbose_name=_("who is it?"),
        on_delete=models.CASCADE,
        related_name='to_relations',
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
        verbose_name = _("Family Relation")
        verbose_name_plural = _("Family Relations")
        unique_together = ('from_member', 'to_member', 'relation')

    def __str__(self):
        return f"{self.from_member} - {self.to_member} ({self.relation})"
