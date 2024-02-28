from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.parsers import JSONParser
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
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

    channel_layer = get_channel_layer()
    if player1.profile.channel_name != "":
        async_to_sync(channel_layer.send)(player1.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game started",
        })
    if player2.profile.channel_name != "":
        async_to_sync(channel_layer.send)(player2.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game started",
        })

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

    channel_layer = get_channel_layer()
    if game.player1.profile.channel_name != "":
        async_to_sync(channel_layer.send)(game.player1.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game ended",
        })
    if game.player2.profile.channel_name != "":
        async_to_sync(channel_layer.send)(game.player2.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game ended",
        })

    return Response({}, status.HTTP_200_OK)

@api_view(["POST"])
def drop_game(request, format=None):
    data = json.loads(request.data)
    try:
        game = Game.objects.get(pk=data["gameid"])
    except ObjectDoesNotExist:
        return Response({}, status=status.HTTP_400_BAD_REQUEST)
    game.delete()

    channel_layer = get_channel_layer()
    if game.player1.profile.channel_name != "":
        async_to_sync(channel_layer.send)(game.player1.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game ended",
        })
    if game.player2.profile.channel_name != "":
        async_to_sync(channel_layer.send)(game.player2.profile.channel_name, {
            "type": "status.change",
            "text": "server:Game ended",
        })

    return Response({}, status.HTTP_200_OK)
