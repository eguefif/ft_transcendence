###
# 42 OAuth flow:
#   1.  A specific oauth JWT is stored in the client via cookies
#   2.  User is redirected to 42 API and grants privileges to the 42 app
#   3.  The 42 API redirects the user back do this API with a unique code
#   4.  This API checks the oauth JWT and, if valid, sends the unique code
#       to 42 API in exchange for access/refresh tokens
#   5.  User information is fetched from the 42 API using the access token
#   6.  User is created and/or authenticated and standard JWT tokens are
#       sent to the client. 42 API tokens are stored in database.
### 

import requests
import json
from os import environ
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from authentication.utils import get_available_username
from userprofile.models import generate_image_uuid

OAUTH_UID = environ.get('OAUTH_UID')
OAUTH_SECRET = environ.get('OAUTH_SECRET')
OAUTH_REDIRECT_URI=environ.get('OAUTH_REDIRECT_URI')
OAUTH_FILL_PASS=environ.get('OAUTH_FILL_PASS')

def get_42_oauth_redirect():
    scope = 'public'
    response_type = 'code'
    return f'https://api.intra.42.fr/oauth/authorize?client_id={OAUTH_UID}&redirect_uri={OAUTH_REDIRECT_URI}&response_type={response_type}&scope={scope}'

def authenticate_42_user(request):
    data = {'status': '',
            'user_info': {},
            'tokens': {}
            }
    try:
        code = request.query_params['code']
    except:
        data['status'] = 'invalid'
        return data
    data['tokens'] = get_42_tokens(code)
    if not data['tokens']:
        data['status'] = 'invalid'
        return data
    data['user_info'] = get_42_user_info(data['tokens'])
    if not data['user_info']:
        data['status'] = 'invalid'
        return data
    data = link_42_user(data)
    return data

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

def link_42_user(data):
    # account exists
    if User.objects.filter(email=data['user_info']['email']).exists():
        user = User.objects.get(email=data['user_info']['email'])
        user.profile.oauth_42_access = data['tokens']['access_token']
        user.profile.oauth_42_refresh = data['tokens']['refresh_token']
        user.save()
        data['user_info']['username'] = user.get_username()
        if user.profile.oauth_42_active:
            data['status'] = 'valid'
            return data
        user.profile.oauth_42_active = True
        user.save()
        data['status'] = 'conflict_email'
        return data
    # account created
    if User.objects.filter(username=data['user_info']['username']):
        data['status'] = 'conflict_username'
        data['user_info']['username'] = get_available_username(data['user_info']['username'])
    else:
        data['status'] = 'valid'
    create_42_user(data)
    return data

def create_42_user(data):
    user = User.objects.create_user(username=data['user_info']['username'],
                                    email=data['user_info']['email'],
                                    password=OAUTH_FILL_PASS)
    user.profile.oauth_42_active = True
    user.profile.oauth_42_access = data['tokens']['access_token']
    user.profile.oauth_42_refresh = data['tokens']['refresh_token']
    image = fetch_42_profile_picture(data['user_info']['profile_picture'])
    if image:
        filename = generate_image_uuid({}, data['user_info']['profile_picture'])
        user.profile.profile_picture.save(filename, ContentFile(image))
    user.save()

def fetch_42_profile_picture(path):
    response = requests.get(path)
    if response.status_code >= 200 and response.status_code < 300:
        return response.content
    return {}

def refresh_42_tokens(user):
    url = 'https://api.intra.42.fr/oauth/token'
    payload = {'grant_type': 'refresh_token',
            'refresh_token': user.profile.oauth_42_refresh
            }
    result = requests.post(url, data=payload)
    try:
        content_str = result.content.decode('utf-8')
        content = json.loads(content_str)
        user.profile.oauth_42_access = content['access_token']
        user.profile.oauth_42_refresh = content['refresh_token']
        user.save()
        return True
    except:
        return False
