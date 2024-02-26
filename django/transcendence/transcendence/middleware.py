from django.contrib.auth.models import User, AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs
from authentication.manageTokens import get_token_user

@database_sync_to_async
def get_user(token):
    try:
        username = get_token_user(token)
        return User.objects.get(username=username)
    except:
        return AnonymousUser()

class JwtAuthMiddleware:

    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, recieve, send):
        token = parse_qs(scope["query_string"].decode("utf8"))["token"][0]
        scope["user"] = await get_user(token)
        return await self.app(scope, recieve, send)