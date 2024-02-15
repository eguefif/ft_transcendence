from gamesManager.models import Game
from rest_framework import serializers

class  GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ["id", "player1", "player2", "winner",
                "score_player1", "score_player2", "time"]
