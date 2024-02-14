from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
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

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_info(request):
    user = request.user
    serializer = UserProfileSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserProfileSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response({"user": serializer.data}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def upload_image(request):
    user = request.user
    profile = user.profile
    # os.makedirs(f'profiles/{user.id}', exist_ok=True)
    # save_path = f'profiles/{user.id}/image.jpg'
    if request.FILES.get('image'):
        recieved_image = request.FILES['image']
        # with open(save_path, 'wb+') as destination:
        #     for chunk in recieved_image.chunks():
        #         destination.write(chunk)
        profile.profile_picture = recieved_image
        profile.save()
        return Response({'message': 'Image uploaded successfully'}, status=status.HTTP_201_CREATED)
    return Response({'error': 'Could not upload image'}, status=status.HTTP_400_BAD_REQUEST)