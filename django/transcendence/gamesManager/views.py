from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.parsers import JSONParser
from rest_framework import status
import json


from gamesManager.models import Game
from gamesManager.serializers import GameSerializer

@api_view(["POST"])
def create_game(request, format=None):
    data = json.loads(request.data)
    try:
        player1 = User.objects.get(username=data["player1"])
        player2 = User.objects.get(username=data["player2"])
    except ObjectDoesNotExist:
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    time = data["creationtime"]
    game_status = "in progress"
    game = Game.objects.create(player1=player1,
                                player2=player2,
                                time=time,
                                status=game_status)
    game.save()
    gameid = game.pk
    return Response({"gameid": gameid}, status.HTTP_201_CREATED)

@api_view(["POST"])
def end_game(request, format=None):
    data = json.loads(request.data)
    try:
        winner = User.objects.get(username=data["winner"])
    except ObjectDoesNotExist:
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    try:
        game = Game.objects.get(pk=data["gameid"])
    except ObjectDoesNotExist:
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    game.winner = winner
    game.status = "over"
    game.score_player1 = data["score_player1"]
    game.score_player2 = data["score_player2"]
    game.save()
    return Response({}, status.HTTP_200_OK)


@api_view(["GET"])
def get_games(request, format=None):
    data = Game.objects.all()
    serializer = GameSerializer(data, many=True)
    return Response(serializer.data,  status.HTTP_200_OK)
