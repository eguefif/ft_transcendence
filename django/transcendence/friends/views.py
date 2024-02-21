from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from authentication.decorator import require_authorization
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from friends.models import Friendship
from django.db import models
from friends.serializers import FriendshipSerializer

from authentication.manageTokens import get_token_user

@api_view(['GET'])
@require_authorization
def get_friend_requests(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)

        pending_friendships = Friendship.objects.filter(
            user2=user,
            status=Friendship.ACCEPTED
        )

        serializer = FriendshipSerializer(pending_friendships, many=True)
        return Response(data=serializer.data, status=status.HTTP_200_OK)
    except:
        return Response({'error': 'Could not get pending friend requests'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def send_friend_request(request):
    username = get_token_user(request.headers["Authorization"])
    user = User.objects.get(username=username)
    userRequest = get_object_or_404(User, username=request.data['username'])

    friendship_exists = Friendship.objects.filter(
        (models.Q(user1=user)) & (models.Q(user2=userRequest)) |
        (models.Q(user1=userRequest)) & (models.Q(user2=user))
    ).exists()

    if friendship_exists:
        return Response({'error': 'Already friends'}, status=status.HTTP_400_BAD_REQUEST)
    
    friendship = Friendship.objects.create(user1=user, user2=userRequest)
    return Response({'success': 'Request sent'}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@require_authorization
def accept_friend_request(request):
    try:
        username = get_token_user(request.headers["Authorization"])
        user = User.objects.get(username=username)
        friend_request = Friendship.objects.get(pk=request.data['friendshipID'], user2=user)
        friend_request.status = Friendship.ACCEPTED
        friend_request.save() # Update date_added a cause de auto_now=True
        return Response({'success': 'Friend request accepted'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)