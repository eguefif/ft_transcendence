from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    # file will be uploaded to MEDIA_ROOT/uploadto
    profile_picture = models.ImageField(upload_to=None)