from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Friendship(models.Model):
    ACCEPTED = 'Accepted'
    PENDING = 'Pending'
    STATUS = ( (ACCEPTED, 'Accepted'), (PENDING, 'Pending') )

    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='%(class)s_sender')
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='%(class)s_reciever')
    status = models.CharField(max_length=10, choices=STATUS, default=PENDING)
    date_added = models.DateField(auto_now=True)