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


from register.serializers import UserSerializer, UserNoPasswordSerializer


@api_view(['POST'])
def login(request, format=None):
    user = get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    serializerNoPassword = UserSerializer(instance=user)
    return Response({"token": token.key,
                     "user": serializerNoPassword.data},
                     status=status.HTTP_201_CREATED)

@api_view(['POST'])
def register(request, format=None):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user = User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()
        token = Token.objects.create(user=user)
        serializerNoPassword = UserSerializer(instance=user)
        return Response({"token": token.key,
                         "user": serializerNoPassword.data},
                         status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def is_token_valid(request):
    return Response({"authenticate": True})

@api_view(['DELETE'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout(request):
    user = get_object_or_404(User, username=request.data['username'])
    token = get_object_or_404(Token, user=request.data['id'])
    if token:
        token.delete()
        return Response({}, status.HTTP_204_NO_CONTENT)
    return Response({"logout": False}, status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([SessionAuthentication, TokenAuthentication])
@permission_classes([IsAuthenticated])
def user_info(request):
    user_id = request.query_params.get('id', None)
    if user_id:
        token = get_object_or_404(Token, user=user_id)
        return Response({"ok": "ok"}, status=status.HTTP_200_OK)
    return Response(None, status=status.HTTP_404_NOT_FOUND)