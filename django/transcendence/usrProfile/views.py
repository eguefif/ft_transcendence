from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


from gamesManager.models import Game
from userprofile.models import Profile
from authentication.manageTokens import get_token_user
from authentication.decorator import require_authorization


def get_image(user):
    if not user:
        return "/images/avatar/png"
    profile_user = Profile.objects.all().filter(user__id=user.id)
    try:
        profile_user = profile_user[0]
    except Exception as e:
        usrImg = "/images/avatar.png"
        return usrImg

    if not profile_user.profile_picture:
        usrImg = "/images/avatar.png"
    else:
        usrImg = profile_user.profile_picture
    return usrImg

def get_games_history(games, user):
    retval = dict()
    counter = 0
    usrImg = get_image(user)
    for game in games:
        entry = dict()
        try:
            player2 = game.player2.username
            player2_user = User.objects.get(username=player2)
        except Exception:
            player2 = "unknown"
            player2_user = None
        user2_img = get_image(player2_user)
        entry["player1"] = game.player1.username
        entry["player2"] = player2
        if len(game.score_player1) == 0:
            entry["score_player1"] = 0
        else:
            entry["score_player1"] = int(game.score_player1)
        if len(game.score_player2) == 0:
            entry["score_player2"] = 0
        else:
            entry["score_player2"] = int(game.score_player2)
        entry["time"] = game.time
        if game.player1.username == user.username:
            entry["avatar1"] = usrImg
            entry["avatar2"] = user2_img
        else:
            entry["avatar2"] = usrImg
            entry["avatar1"] = user2_img
        retval[counter] = entry
        counter += 1
    return retval

@api_view(["GET"])
@require_authorization
def get_profile(request):
    username = get_token_user(request.headers["Authorization"])
    try:
        user = User.objects.get(username=username)
    except Exception:
        retval = {}
        retval = {"error": "no such username in database"}
        return Response(retval, status.HTTP_400_BAD_REQUEST)
    games = Game.objects.all().filter(Q(player1__id=user.id) |
                                    Q(player2__id=user.id))
    if len(games) == 0:
        retval = {}
        retval = {"error": "no games with that username"}
        return Response(retval, status.HTTP_400_BAD_REQUEST)

    games_history = get_games_history(games, user)

    if not games_history:
        retval = {}
        retval = {"error": "impossible to generate games data"}
        return Response(retval, status.HTTP_400_BAD_REQUEST)
    return Response(games_history, status.HTTP_200_OK)
