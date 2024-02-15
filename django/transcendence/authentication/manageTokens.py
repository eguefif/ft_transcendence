from os import environ
from jwt import encode, decode
from datetime import datetime, timedelta, timezone

secret = environ.get('JWT_SECRET')

def get_access_token(username):
    payload = {"username": username,
               "exp": datetime.now(tz=timezone.utc) + timedelta(minutes=5)
               }
    return encode(payload, secret, algorithm="HS256")

def get_refresh_token(username):
    payload = {"username": username,
               "exp": datetime.now(tz=timezone.utc) + timedelta(days=3)
               }
    return encode(payload, secret, algorithm="HS256")

def get_token_user(token):
    try:
        username = decode(token, secret, algorithms="HS256")["username"]
        return username
    except:
        return None
