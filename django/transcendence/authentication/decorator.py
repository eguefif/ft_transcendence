from os import environ
from jwt import decode
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from datetime import datetime


secret = environ.get('JWT_SECRET')

def require_authorization(func):
    def wrapper_require_authorization(*args, **kwargs):
        request = args[0]
        try:
            token = request.headers["Authorization"]
            payload = decode(token, secret, algorithms="HS256")
            username = payload["username"]
            expiry = payload["exp"]
            user = User.objects.get(username=username)
        except:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        return func(*args, **kwargs)

    return wrapper_require_authorization
