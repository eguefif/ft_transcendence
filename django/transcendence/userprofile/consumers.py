import json
from channels.generic.websocket import WebsocketConsumer
from userprofile.models import Profile

class OnlineStatusConsumer(WebsocketConsumer):

    def connect(self):
        # self.user = self.scope['user']
        # print(self.scope['query_string'])
        self.accept()
        print(self.scope['headers'])
        
        #self.user = self.scope['user']
        #print(self.scope['token'])

        #self.user.profile.online_status = Profile.ONLINE
        # self.send(text_data=json.dumps({
        #     'type': 'connection_established'
        # }))

    def receive(self, text_data):
        print(text_data)