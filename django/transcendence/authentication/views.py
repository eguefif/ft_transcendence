from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from datetime import timedelta

from authentication.serializers import UserSerializer
from authentication.manageTokens import get_access_token, get_refresh_token, get_token_user
from authentication.decorator import require_authorization

@api_view(['POST'])
def authenticate(request):
    if request.data['formType'] == "register":
        return register(request) 
    if request.data['formType'] == "login":
        return login(request)
    return Response("invalid request", status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def logout(request):
    response = Response(status=status.HTTP_204_NO_CONTENT)
    Response.delete_cookie(self=response,
                           key='refreshToken',
                           path='/api/auth/refresh')
    return response

@api_view(['POST'])
def refresh(request):
    try:
        token = request.COOKIES["refreshToken"]
    except:
        return Response({'info': 'no token provided'}, status=status.HTTP_401_UNAUTHORIZED)
    username = get_token_user(token)
    if not username:
        return Response({'info': 'invalid token provided'}, status=status.HTTP_401_UNAUTHORIZED)
    try:
        user = User.objects.get(username=username)
    except:
        return Response({'info': 'user does not exist'}, status=status.HTTP_401_UNAUTHORIZED)
    return  get_authenticated_response(user, status.HTTP_200_OK)

def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()
        return get_authenticated_response(user, status.HTTP_201_CREATED) 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def login(request):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({'info': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return get_authenticated_response(user, status.HTTP_200_OK)


def get_authenticated_response(user, status):
    response = Response({"accessToken": get_access_token(user.get_username())},
                        status=status)
    Response.set_cookie(self=response,
                        key='refreshToken',
                        value=get_refresh_token(user.get_username()),
                        max_age=timedelta(days=3),
                        secure=True,
                        httponly=True,
                        samesite='Lax',
                        path='/api/auth/refresh')
    return response
