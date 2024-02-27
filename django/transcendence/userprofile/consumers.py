import json
import asyncio
from datetime import datetime, timedelta
from channels.generic.websocket import AsyncWebsocketConsumer
from userprofile.models import Profile
from django.contrib.auth.models import User, AnonymousUser
from friends.models import Friendship
from django.db import models
from channels.db import database_sync_to_async
from authentication.manageTokens import get_token_user
from channels.layers import get_channel_layer

@database_sync_to_async
def get_user(token):
    try:
        username = get_token_user(token)
        return User.objects.get(username=username)
    except:
        return None

@database_sync_to_async
def set_status(user, status):
    try:
        profile = Profile.objects.get(user=user)
        profile.online_status = status
        profile.save()
    except:
        print("Could not save status")

@database_sync_to_async
def save_channel_name(user, channel_name):
    try:
        profile = Profile.objects.get(user=user)
        profile.channel_name = channel_name
        profile.save()
    except:
        print("Could not save channel name")

@database_sync_to_async
def get_friends_channel_names(user):
    channels = []
    try:
        friendships = Friendship.objects.filter(
            (models.Q(user1=user) | models.Q(user2=user)),
            status=Friendship.ACCEPTED
        )

        for fs in friendships:
            friend = fs.user1 if fs.user2 == user else fs.user2
            if friend.profile.channel_name != "":
                channels.append(friend.profile.channel_name)

        return channels
    except:
        print("Could not get users")
        return None

class OnlineStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.authenticated = False
        self.away = False
        self.user = None
        self.last_echo = datetime.now()

        self.check_last_echo_task = asyncio.create_task(self.check_last_echo())

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        
        # Auth user
        if not self.authenticated:
            try:
                token = text_data_json["token"]
                self.user = await get_user(token)
                if self.user:
                    await set_status(self.user, Profile.ONLINE)
                    await save_channel_name(self.user, self.channel_name)
                    self.away = False
                    self.authenticated = True
            except:
                await self.close()

        # Process messages if authenticated
        if self.authenticated and self.user:
            try:
                message = text_data_json["message"]
                await self.send(text_data=message)
                if message == 'online' and self.away:
                    self.last_echo = datetime.now()
                    self.away = False
                    await set_status(self.user, Profile.ONLINE)
                    channel_layer = get_channel_layer()
                    channels = await get_friends_channel_names(self.user) #notify friends
                    for c in channels:
                        await channel_layer.send(c, {
                            "type": "status.change",
                            "text": f'{self.user} is now online',
                        })
            except:
                print("No message to process")
        else:
            await self.close()
        
    async def disconnect(self, close_code):
        print(f'Closed connection. code={close_code}')
        await set_status(self.user, Profile.OFFLINE)
        self.check_last_echo_task.cancel()

    async def check_last_echo(self):
        while True:
            if self.authenticated and self.user:
                if datetime.now() - self.last_echo > timedelta(seconds=10):
                    channel_layer = get_channel_layer()
                    channels = await get_friends_channel_names(self.user) #notify friends
                    if not self.away:
                        for c in channels:
                            await channel_layer.send(c, {
                                "type": "status.change",
                                "text": f'{self.user} is now away',
                            })
                        self.away = True
                        await set_status(self.user, Profile.AWAY)
            await asyncio.sleep(5)

    async def status_change(self, event):
        await self.send(text_data=event["text"])