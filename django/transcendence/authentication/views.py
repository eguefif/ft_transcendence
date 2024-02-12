from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response

from authentication.serializers import UserSerializer
from authentication.genTokens import getAccessKey, getRefreshKey
@api_view(['POST'])
def authenticate(request, format=None):
    if request.data['formType'] == "register":
        return register(request, format) 
    if request.data['formType'] == "login":
        return login(request, format)
    return Response("invalid request", status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def refresh(request, format=None):
    return Response({"user": "hello"},
                    status=status.HTTP_200_OK)

def register(request, format=None):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()
        return Response({"access": getAccessKey(user.get_username()),
                         "refresh": getRefreshKey(user.get_username())},
                         status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def login(request, format=None):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
#    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    return Response({"token": "tmp",
                     "user": serializer.data},
                     status=status.HTTP_201_CREATED)

