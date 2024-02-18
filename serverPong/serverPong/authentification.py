from jwt import decode
from os import environ
import logging
import json

SECRET = environ.get('JWT_SECRET')


def authenticate(msg):
    username = None
    try:
        msg = json.loads(msg)
    except Exception as e:
        logging.error(f"Exception {e} while loading json: {msg}")
        return None
    try:
        username = decode(msg["token"], SECRET, algorithms="HS256")["username"]
    except Exception as e:
        logging.warning(f"Exception: {e}")
        return None
    return username
