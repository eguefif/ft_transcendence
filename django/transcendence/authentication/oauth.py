from os import environ
import requests
import json

from django.contrib.auth.models import User

OAUTH_UID = environ.get('OAUTH_UID')
OAUTH_SECRET = environ.get('OAUTH_SECRET')
OAUTH_REDIRECT_URI=environ.get('OAUTH_REDIRECT_URI')

def get_42_oauth_redirect():
    scope = 'public'
    response_type = 'code'
    return f'https://api.intra.42.fr/oauth/authorize?client_id={OAUTH_UID}&redirect_uri={OAUTH_REDIRECT_URI}&response_type={response_type}&scope={scope}'

def authenticate_42_user(request):
    try:
        code = request.query_params['code']
    except:
        return 'invalid'
    tokens = get_42_tokens(code)
    if not tokens:
        return 'invalid'
    user_info = get_42_user_info(tokens)
    if not user_info:
        return 'invalid'
    print(user_info)
#    link_user(username, email)
    return 'valid'

def get_42_tokens(code):
    url = 'https://api.intra.42.fr/oauth/token'
    payload = {'grant_type': 'authorization_code',
            'client_id': OAUTH_UID,
            'client_secret': OAUTH_SECRET,
            'code': code,
            'redirect_uri': OAUTH_REDIRECT_URI
            }
    result = requests.post(url, data=payload)
    try:
        content_str = result.content.decode('utf-8')
        content = json.loads(content_str)
        access_token = content['access_token']
        refresh_token = content['refresh_token']
    except:
        return {}
    return  {'access_token': access_token, 'refresh_token': refresh_token}

def refresh_42_tokens(tokens):
    url = 'https://api.intra.42.fr/oauth/token'
    payload = {'grant_type': 'refresh_token',
            'refresh_token': tokens['refresh_token']
            }
    result = requests.post(url, data=payload)
    try:
        content_str = result.content.decode('utf-8')
        content = json.loads(content_str)
        access_token = content['access_token']
        refresh_token = content['refresh_token']
    except:
        return {}
    return  {'access_token': access_token, 'refresh_token': refresh_token}

def get_42_user_info(tokens):
    url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': 'Bearer ' + tokens['access_token']}
    result = requests.get(url, headers=headers)
    try:
        content_str = result.content.decode('utf-8')
        content = json.loads(content_str)
        user_info = {'username': content['login'],
                     'email': content['email'],
                     'profile_picture': content['image']['versions']['medium']
                     }
    except:
        return {}
    return user_info 
