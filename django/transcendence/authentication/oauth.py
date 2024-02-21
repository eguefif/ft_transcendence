from os import environ
import requests

OAUTH_UID = environ.get('OAUTH_UID')
OAUTH_SECRET = environ.get('OAUTH_SECRET')
OAUTH_REDIRECT_URI=environ.get('OAUTH_REDIRECT_URI')

def request_42_oauth():
    url = 'https://api.intra.42.fr/oauth/token'
    payload = {
            'grant_type': 'client_credentials',
            'client_id': OAUTH_UID,
            'client_secret': OAUTH_SECRET,
            }
    result = requests.post(url, data = payload)
    return result;

def get_42_oauth_redirect():
    scope = 'public'
    response_type = 'code'
    return f'https://api.intra.42.fr/oauth/authorize?client_id={OAUTH_UID}&redirect_uri={OAUTH_REDIRECT_URI}&response_type={response_type}&scope={scope}'
