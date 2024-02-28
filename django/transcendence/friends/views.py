from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from authentication.decorator import require_authorization
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from friends.models import Friendship
from django.db import models
from friends.serializers import FriendshipSerializer, UserFriendInfoSerializer
from userprofile.serializers import UserProfileSerializer

from authentication.manageTokens import get_token_user

@api_view(['GET'])
@require_authorization
def get_friend_requests(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)

        pending_friendships = Friendship.objects.filter(
            user2=user,
            status=Friendship.PENDING
        )

        user_data = []
        for fs in pending_friendships:
            friend = fs.user1 if fs.user2 == user else fs.user2
            friend_serializer = UserFriendInfoSerializer(friend)
            user_data.append(friend_serializer.data)

        return Response(data=user_data, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Could not get pending friend requests'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@require_authorization
def get_friend_list(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)

        friendships = Friendship.objects.filter(
            (models.Q(user1=user) | models.Q(user2=user)),
            status=Friendship.ACCEPTED
        )

        user_data = []
        for fs in friendships:
            # 1 - Get the user that is not the user making the request (user1 or user2)
            friend = fs.user1 if fs.user2 == user else fs.user2
            # 2 - Send data back as Array of serialized user data
            friend_serializer = UserFriendInfoSerializer(friend)
            user_data.append(friend_serializer.data)

        return Response(data=user_data, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Could not get friends'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def send_friend_request(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    userRequest = get_object_or_404(User, username=request.data['username'])

    friendship_exists = Friendship.objects.filter(
        (models.Q(user1=user) & models.Q(user2=userRequest)) |
        (models.Q(user1=userRequest) & models.Q(user2=user))
    ).exists()

    if friendship_exists:
        return Response({'error': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
    
    if user == userRequest:
        return Response({'error': 'Cant be friends with yourself'}, status=status.HTTP_400_BAD_REQUEST)
    friendship = Friendship.objects.create(user1=user, user2=userRequest)
    return Response({'success': 'Request sent'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@require_authorization
def accept_friend_request(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)
        userToAccept = User.objects.get(username=request.data['username'])
        friend_request = Friendship.objects.get(user1=userToAccept, user2=user)
        friend_request.status = Friendship.ACCEPTED
        friend_request.save() # Update date_added a cause de auto_now=True
        return Response({'success': 'Friend request accepted'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@require_authorization
def decline_friend_request(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)
        userToDecline = User.objects.get(username=request.data['username'])
        friendship = Friendship.objects.get(user1=userToDecline, user2=user)
        friendship.delete()
        return Response({'success': 'User has been declined'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@require_authorization
def delete_friendship(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    userToDelete = get_object_or_404(User, username=request.data['username'])

    friendship = Friendship.objects.filter(
        (models.Q(user1=user) & models.Q(user2=userToDelete)) |
        (models.Q(user1=userToDelete) & models.Q(user2=user))
    )
    
    if friendship.exists():
        friendship.delete()
        return Response({'succes': 'Friend deleted'}, status=status.HTTP_200_OK)

    return Response({'error': 'Not friends'}, status=status.HTTP_400_BAD_REQUEST)
