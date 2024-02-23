from django.urls import re_path
from . import consumers

# Sends websocket to consumer
websocket_urlpatterns = [
    re_path(r'online_status/', consumers.OnlineStatusConsumer.as_asgi()),
]