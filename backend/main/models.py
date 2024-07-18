from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from django.core.management.utils import get_random_string
from mptt.models import MPTTModel, TreeForeignKey

from core.utils import UploadPath, BaseModel


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
    name = models.CharField(verbose_name=_("Name"), max_length=64, blank=False, null=False)
    description = models.TextField(verbose_name=_("Description"), blank=True, null=True)
    avatar = models.ImageField(
        verbose_name=_("Avatar"),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True,
    )
    bg_cover = models.ImageField(
        verbose_name=_("Background Cover"),
        upload_to=UploadPath(folder="pictures", sub_path="covers"),
        blank=True,
        null=True,
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
    )

    class Meta:
        verbose_name = _("Family")
        verbose_name_plural = _("Families")
        ordering = ["name"]

    def __str__(self):
        return self.name

    def set_invite_code(self):
        self.invite_code = get_random_string(10, "QWERTYUIOPASDFGHJKLZXCVBNM123456789")
        self.save()
        return self.invite_code


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


class FamilyTree(MPTTModel):
    family = models.ForeignKey(
        Family,
        verbose_name=_("Family"),
        on_delete=models.CASCADE,
        related_name="tree_nodes",
        blank=False,
        null=False,
    )
    name = models.CharField(verbose_name=_("Node Name"), max_length=50, blank=False, null=False)
    avatar = models.ImageField(
        verbose_name=_("Avatar"),
        upload_to=UploadPath(folder="pictures", sub_path="avatars"),
        blank=True,
        null=True,
    )
    date_of_birth = models.DateField(verbose_name=_("Date of Birth"), blank=True, null=True)
    date_of_death = models.DateField(verbose_name=_("Date of Death"), blank=True, null=True)
    parent = TreeForeignKey(
        'self',
        verbose_name=_("Parent"),
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )

    class MPTTMeta:
        order_insertion_by = ['name']

    class Meta:
        verbose_name = _("Family Tree")
        verbose_name_plural = _("Families Tree")

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.date_of_birth and self.date_of_death and self.date_of_birth > self.date_of_death:
            raise ValueError(_("Date of Birth cannot be after Date of Death"))
        super().save(*args, **kwargs)

    def get_full_name(self):
        """Get the full name including the parent's name for better display."""
        if self.parent:
            return f"{self.name} ({self.parent.name})"
        return self.name
