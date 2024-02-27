from django.contrib.auth.models import User
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os

from userprofile.serializers import UserProfileSerializer
from userprofile.models import Profile
from authentication.manageTokens import get_token_user
from gamesManager.models import Game
from authentication.decorator import require_authorization

@api_view(['GET'])
@require_authorization
def user_info(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

# Get l'image profile du user logged in, besoin de changer si on veux afficher l'image d'un autre user
@api_view(['GET'])
@require_authorization
def user_picture(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    try:
        image_path = user.profile.profile_picture.path
        return FileResponse(open(image_path, 'rb'))
    except:
        return Response({'error': 'No image found'}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@require_authorization
def update_profile(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def upload_image(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    profile = user.profile
    if request.FILES.get('image'):
        current_picture = profile.profile_picture
        if current_picture and os.path.isfile(current_picture.path):
            os.remove(current_picture.path)
        recieved_image = request.FILES['image']
        profile.profile_picture = recieved_image
        profile.save()
        return Response({'message': 'Image uploaded successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Could not upload image'}, status=status.HTTP_400_BAD_REQUEST)

def get_image(user):
    if not user:
        return "/images/avatar.png"
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
    usrImg = "/images/avatar.png"
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
    try:
        username = get_token_user(request.headers["Authorization"])
    except Exception as e:
        print("in request catch:", e)
        return Response(retval, status.HTTP_400_BAD_REQUEST)
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
