from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
import os

from userprofile.serializers import UserProfileSerializer
from userprofile.models import Profile
from userprofile.forms import UploadImageForm
from authentication.manageTokens import get_token_user
from authentication.decorator import require_authorization
from friends.models import Friendship
from gamesManager.models import Game

@api_view(['GET'])
@require_authorization
def user_info(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)
    except:
        return Response({'error':'bad request'}, status=status.HTTP_400_BAD_REQUEST)
    data = {'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'authType': ('42' if user.profile.oauth_42_active else 'standard'),
            'otp': (True if user.profile.otp_active else False)
            }
    return Response(data, status=status.HTTP_200_OK)


# Get l'image profile du user logged in, besoin de changer si on veux afficher l'image d'un autre user
@api_view(['GET'])
@require_authorization
def user_picture(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    try:
        image_url= user.profile.profile_picture.url
        return Response({'image': image_url}, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'No image found'}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@require_authorization
def update_profile(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=username)
        return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def is_image_valid(request):
    form = UploadImageForm(request.POST, request.FILES)
    if form.is_valid():
        return True
    return False

@api_view(['POST'])
@require_authorization
def upload_image(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    profile = user.profile
    if request.FILES.get('image') and is_image_valid(request):
        current_picture = profile.profile_picture
        if current_picture and os.path.isfile(current_picture.path) and os.path.basename(current_picture.path) != "avatar.png":
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
        usrImg = profile_user.profile_picture.url
    return usrImg

def is_friend(target, user):
    return Friendship.objects.filter(
        (Q(user1=user) & Q(user2=target)) |
        (Q(user1=target) & Q(user2=user))
    ).exists()

def get_games_history(games, user, currentUsername):
    retval = dict()
    counter = 0
    usrImg = get_image(user)
    for game in games:
        if game.score_player1 != "3" and game.score_player2 != "3":
            continue
        entry = dict()
        try:
            if game.player1.username == user.username:
                player2 = game.player2.username
                player2_user = User.objects.get(username=player2)
                player2_img = get_image(player2_user)
                player1 = user.username
                player1_user = user
                player1_img = usrImg
            else:
                player1 = game.player1.username
                player1_user = User.objects.get(username=player1)
                player1_img = get_image(player1_user)
                player2 = user.username
                player2_user = user
                player2_img = usrImg
        except Exception:
            player2 = "unknown"
            player2_user = None
            player1 = "unknown"
            player1_user = None
        entry["player1"] = player1
        entry["player2"] = player2
        entry["player1_add"] = True
        entry["player2_add"] = True
        if currentUsername == player1:
            entry["player2_add"] = is_friend(player2_user, player1_user)
        else:
            entry["player1_add"] = is_friend(player1_user, player2_user)
        entry["score_player1"] = int(game.score_player1)
        entry["score_player2"] = int(game.score_player2)
        entry["time"] = game.time
        entry["avatar1"] = player1_img
        entry["avatar2"] = player2_img
        retval[counter] = entry
        counter += 1
    return retval

@api_view(["GET"])
@require_authorization
def get_games(request):
    try:
        username = request.GET["user"]
        currentUsername = get_token_user(request.headers["Authorization"])
        print("username request: ", username)
        print("Current user:", username)
    except Exception as e:
        return Response({"error": "username not found"}, status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=username)
    except Exception:
        retval = {}
        retval = {"error": "username not found"}
        return Response(retval, status.HTTP_400_BAD_REQUEST)
    games = Game.objects.all().filter(Q(player1__id=user.id) |
                                    Q(player2__id=user.id)).order_by('-time')
    if len(games) == 0:
        retval = {}
        retval = {"error": "No game played yet"}
        return Response(retval, status.HTTP_200_OK)

    games_history = get_games_history(games, user, currentUsername)

    if not games_history:
        retval = {}
        retval = {"error": "No game played yet"}
        return Response(retval, status.HTTP_200_OK)
    return Response(games_history, status.HTTP_200_OK)
