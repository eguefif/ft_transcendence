from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    player1 = models.ForeignKey(User,
                                related_name="+",
                                on_delete=models.SET_NULL,
                                null=True,)
    player2 = models.ForeignKey(User,
                                related_name="+",
                                on_delete=models.SET_NULL,
                                null=True,)
    winner = models.ForeignKey(User,
                                related_name="+",
                                on_delete=models.SET_NULL,
                                null=True,)
    time = models.CharField(max_length=20)
    score_player1 = models.CharField(max_length=4)
    score_player2 = models.CharField(max_length=4)
    status = models.CharField(max_length=20)
