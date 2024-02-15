from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http import HttpResponse, FileResponse
from authentication.decorator import require_authorization
from rest_framework import status, permissions
from rest_framework.decorators import api_view
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.authtoken.models import Token
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated
import os

from userprofile.serializers import UserProfileSerializer
from authentication.manageTokens import get_token_user

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