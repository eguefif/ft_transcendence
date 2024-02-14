from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    player1 = models.ForeignKey(User)
    player2 = models.ForeignKey(User)
    time = models.CharField(max_length=20)
    score_player1 = models.CharField(max_length=2)
    score_player2 = models.CharField(max_length=2)
    winner = models.ForeignKey(User)
