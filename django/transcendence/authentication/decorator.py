from os import environ
from jwt import decode
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User


secret = environ.get('JWT_SECRET')

def require_authorization(func):
    def wrapper_require_authorization(*args, **kwargs):
        request = args[0]
        try:
            token = request.headers["Authorization"]
            username = decode(token, secret, algorithms="HS256")["username"]
            user = User.objects.get(username=username)
        except Exception as e:
            return Response(status=status.HTTP_401_UNAUTHORIZED);
        return func(*args, **kwargs)
    return wrapper_require_authorization
