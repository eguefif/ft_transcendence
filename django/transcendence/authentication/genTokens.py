from os import environ
from jwt import encode, decode
from datetime import datetime, timedelta

secret = environ.get('JWT_SECRET')

def getAccessKey(username):
    payload = {"username": username,
               "exp": datetime.now() + timedelta(minutes=5)
               }
    return encode(payload, secret, algorithm="HS256")

def getRefreshKey(username):
    payload = {"username": username,
               "exp": datetime.now() + timedelta(days=3)
               }
    return encode(payload, secret, algorithm="HS256")

