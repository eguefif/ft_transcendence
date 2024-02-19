from jwt import encode, decode
from os import environ

SECRET = environ.get('JWT_SECRET')

def authenticate(msg):
    username = None
    try:
        username = decode(msg["token"], SECRET, algorithms="HS256")["username"]
    except:
        print("Token invalid")
        return None
    return username
