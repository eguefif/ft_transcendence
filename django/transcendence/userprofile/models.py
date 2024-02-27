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
    ONLINE = 'Online'
    OFFLINE = 'Offline'
    AWAY = 'Away'
    PLAYING = 'Playing'
    STATUS = ( (ONLINE, 'Online'), (OFFLINE, 'Offline'), (AWAY, 'Away'), (PLAYING, 'Playing') )
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to=generate_image_uuid)
    online_status = models.CharField(max_length=20, choices=STATUS, default=OFFLINE)
    channel_name = models.CharField(max_length=100, default="")
    otp_active = models.BooleanField(default=False)
    otp_key = models.CharField(max_length=32, default="")
    otp_previous = models.CharField(max_length=6, default="")

# Signals to create one to one when user is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
