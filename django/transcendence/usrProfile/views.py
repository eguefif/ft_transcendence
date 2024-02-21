from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response


from gamesManager import Game
from userprofile import Profile
from authentication.manageTokens import get_token_user

@api_view(["GET"])
def getProfile(request):
    username = get_token_user(request.headers["Authorization"])
    games = Game.objects.all().filter(player1__iexact=username,
                                    player2__iexact=username)

    profile_user = Profile.get(user=username)
