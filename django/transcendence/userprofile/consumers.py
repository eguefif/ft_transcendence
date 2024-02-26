import json
import asyncio
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from userprofile.models import Profile
from django.contrib.auth.models import User, AnonymousUser
from channels.db import database_sync_to_async
from authentication.manageTokens import get_token_user

@database_sync_to_async
def get_user(token):
    try:
        username = get_token_user(token)
        return User.objects.get(username=username)
    except:
        return None

class OnlineStatusConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        await self.accept()
        self.authenticated = False
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
                    self.authenticated = True
            except:
                await self.close()

        # Process messages if authenticated
        if self.authenticated:
            await self.send(text_data=f'Logged in as {self.user.username}')
        else:
            await self.close()
        
    async def disconnect(self, close_code):
        print(f'Closed connection. code={close_code}')
        self.check_last_echo_task.cancel()
        # Set OFFLINE


    async def check_last_echo(self):
        while True:
            if self.authenticated:
                #Check last echo, set away if more than 5 minutes
                await self.send(text_data=str(self.last_echo))
            await asyncio.sleep(5)