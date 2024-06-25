from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Post, PostLike, Comment, CommentLike


@receiver(post_save, sender=Post)
def create_post_like(sender, instance, created, **kwargs):
    if created:
        PostLike.objects.create(post=instance)


@receiver(post_save, sender=Comment)
def create_post_comment_like(sender, instance, created, **kwargs):
    if created:
        CommentLike.objects.create(comment=instance)
