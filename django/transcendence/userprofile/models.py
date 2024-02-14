from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
import os

def generate_image_uuid(instance, filename):
    ext = filename.split('.')[-1]
    name = uuid.uuid4()
    filename = f'{name}.{ext}'
    return os.path.join('images/', filename)

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # file will be uploaded to MEDIA_ROOT/image
    profile_picture = models.ImageField(upload_to=generate_image_uuid)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()