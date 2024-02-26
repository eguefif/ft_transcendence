from datetime import timedelta
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from authentication.decorator import require_authorization, require_otp_token
from authentication.manageTokens import get_token_user, get_oauth_42_token, get_decoded_token
from authentication.oauth import get_42_oauth_redirect, authenticate_42_user 
from authentication.otp import get_new_otp_key, get_key_qr_code, get_current_code
from authentication.serializers import UserSerializer
from authentication.utils import get_otp_response, get_authenticated_response

###
# Standard routes
###

@api_view(['POST'])
def authenticate(request):
    if request.data['formType'] == "register":
        return register(request)
    if request.data['formType'] == "login":
        return login(request)
    return Response("invalid request", status=status.HTTP_400_BAD_REQUEST)

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
    if user.profile.oauth_42_active or not user.check_password(request.data['password']):
        return Response({'info': 'not found'}, status=status.HTTP_404_NOT_FOUND)
    if user.profile.otp_active:
        return get_otp_response(user, status.HTTP_200_OK)
    return get_authenticated_response(user, status.HTTP_200_OK)

@api_view(['POST'])
@require_authorization
def logout(request):
    response = Response(status=status.HTTP_204_NO_CONTENT)
    response.delete_cookie(key='refreshToken',
                           path='/api/auth/refresh')
    return response

@api_view(['POST'])
def refresh(request):
    response = Response()
    try:
        token = request.COOKIES["refreshToken"]
        decoded_token = get_decoded_token(token)
        user = User.objects.get(username=decoded_token["username"])
    except:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return response
    try:
        if decoded_token["type"] == "refresh":
            return  get_authenticated_response(user, status.HTTP_200_OK)
    except:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return response
    response.status_code = status.HTTP_400_BAD_REQUEST
    return response

###
# OTP routes
###

@api_view(['POST'])
@require_otp_token
def otp(request):
    try:
        code = request.data["code"]
    except:
        return Response({'info': 'invalid code'}, status.HTTP_400_BAD_REQUEST)
    user = User.objects.get(username=get_token_user(request.headers["Authorization"]))
    otp_key = user.profile.otp_key
    if (get_current_code(otp_key) == code and code != user.profile.otp_previous):
        user.profile.otp_previous = code
        user.save()
        return get_authenticated_response(user, status.HTTP_200_OK)
    return Response({'info': 'invalid code'}, status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def otp_activate(request):
    user = User.objects.get(username=get_token_user(request.headers["Authorization"]))
    if not user.profile.otp_active:
        new_otp_key = get_new_otp_key()
        user.profile.otp_active = True
        user.profile.otp_key = new_otp_key
        user.save()
        return Response({'otpCode': get_key_qr_code(new_otp_key, user.username)}, status.HTTP_200_OK)
    return Response({'info': 'otp already activated'}, status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@require_authorization
def otp_deactivate(request):
    user = User.objects.get(username=get_token_user(request.headers["Authorization"]))
    if user.profile.otp_active:
        user.profile.otp_active = False 
        user.profile.otp_key = ""
        user.profile.otp_previous = ""
        user.save()
        return Response(status.HTTP_204_NO_CONTENT)
    return Response({'info': 'otp already deactivated'}, status.HTTP_400_BAD_REQUEST)

###
# OAuth routes
###

@api_view(['POST'])
def oauth(request):
    response = Response()
    try:
        token = request.COOKIES["oauthToken"]
    except:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return response
    response.delete_cookie(key='oauthToken', path='/api/auth/oauth')
    try:
        decoded_token = get_decoded_token(token)
        user = User.objects.get(username=decoded_token["username"])
    except:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return response
    try:
        if decoded_token["type"] == "oauth-42":
            if decoded_token["status"] == "valid" or "conflict" in decoded_token['status']:
                response = get_authenticated_response(user, status.HTTP_200_OK)
                response.delete_cookie(key='oauthToken', path='/api/auth/oauth')
                response.data['oauth_status'] = decoded_token['status']
                return response
            response.status_code = status.HTTP_403_FORBIDDEN
            response.data = {'info': decoded_token["status"]}
            return response
    except:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return response
    reponse.status_code = status.HTTP_400_BAD_REQUEST
    return response

@api_view(['POST'])
def oauth_42(request):
    reply = get_42_oauth_redirect()
    return Response({'redirect': reply}, status=status.HTTP_200_OK)

@api_view(['GET'])
def login_42(request):
    request_info = authenticate_42_user(request)
    response = redirect('https://localhost')
    response.set_cookie(key='oauthToken',
                        value=get_oauth_42_token(request_info['user_info'], request_info['status']),
                        max_age=timedelta(minutes=2),
                        secure=True,
                        httponly=True,
                        samesite='Lax',
                        path='/api/auth/oauth')
    return response
