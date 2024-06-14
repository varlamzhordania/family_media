import os

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator

from main.models import Family, FamilyMembers
from core.utils import BaseModel, UploadPath


# Create your models here.


class Post(BaseModel):
    author = models.ForeignKey(
        FamilyMembers,
        on_delete=models.CASCADE,
        related_name='my_posts',
        verbose_name=_("author"),
        blank=True,
    )
    text = models.TextField(_("text"), max_length=500, blank=True, null=True)
    is_active = models.BooleanField(verbose_name=_("Visible"), default=True)

    def __str__(self):
        return f"{self.id} {self.author}"


class PostMedia(BaseModel):
    post = models.ForeignKey(Post, verbose_name=_("Post"), on_delete=models.CASCADE, related_name="medias")
    file = models.FileField(upload_to=UploadPath(folder="posts", sub_path="media"))
    is_featured = models.BooleanField(_("Is featured"), default=False)

    def __str__(self):
        return f"{self.id} - {self.post}"

    def get_extension(self):
        return os.path.splitext(self.file.name)[1]


class PostLike(BaseModel):
    post = models.OneToOneField(Post, verbose_name=_("Post"), on_delete=models.CASCADE, related_name="like_info")
    users = models.ManyToManyField(
        FamilyMembers,
        verbose_name=_("Users"),
    )
    counter = models.IntegerField(default=0, verbose_name=_("Counter value"), validators=[MinValueValidator(0)])

    class Meta:
        verbose_name = _("Post Like")
        verbose_name_plural = _("Post Likes")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.post} likes"

    def increment_counter(self):
        self.counter += 1
        self.save()

    def decrement_counter(self):
        self.counter -= 1
        self.save()


class Comment(BaseModel):
    post = models.ForeignKey(Post, verbose_name=_("Post"), on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(
        FamilyMembers,
        verbose_name=_("Author"),
        on_delete=models.CASCADE,
        related_name="comments"
    )
    text = models.TextField(_("Text"), max_length=500, blank=False, null=False)

    class Meta:
        verbose_name = _("Comment")
        verbose_name_plural = _("Comments")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.author} on {self.post}"


class CommentLike(BaseModel):
    comment = models.OneToOneField(
        Comment,
        verbose_name=_("Comment"),
        on_delete=models.CASCADE,
        related_name="like_info"
    )
    users = models.ManyToManyField(FamilyMembers, verbose_name=_("Users"))
    counter = models.IntegerField(default=0, verbose_name=_("Counter value"), validators=[MinValueValidator(0)])

    class Meta:
        verbose_name = _("Comment Like")
        verbose_name_plural = _("Comment Likes")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.comment} likes"

    def increment_counter(self):
        self.counter += 1
        self.save()

    def decrement_counter(self):
        self.counter -= 1
        self.save()
