"""
ASGI config for transcendence project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
#from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'transcendence.settings')
django_asgi_app = get_asgi_application()

from django.conf import settings
from channels.routing import ProtocolTypeRouter, URLRouter
import userprofile.routing

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': 
        URLRouter(userprofile.routing.websocket_urlpatterns)
    
})
