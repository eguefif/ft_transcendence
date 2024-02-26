import string
import random
from datetime import timedelta
from django.contrib.auth.models import User
from rest_framework.response import Response
from authentication.manageTokens import get_otp_token, get_access_token, get_refresh_token

def random_string(size=16, chars=string.ascii_lowercase + string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

def get_available_username(username, to_add=1):
    if User.objects.filter(username=(username + f'{to_add}')).exists():
        return get_available_username(username, (to_add + 1))
    return (username + f'{to_add}')

def get_otp_response(user, status):
    response = Response({"otpToken": get_otp_token(user.get_username())},
                        status=status)
    return response

def get_authenticated_response(user, status):
    response = Response({"accessToken": get_access_token(user.get_username())},
                        status=status)
    response.set_cookie(key='refreshToken',
                        value=get_refresh_token(user.get_username()),
                        max_age=timedelta(days=3),
                        secure=True,
                        httponly=True,
                        samesite='Lax',
                        path='/api/auth/refresh')
    return response
