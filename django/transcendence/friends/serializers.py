from friends.models import Friendship
from rest_framework import serializers
from django.contrib.auth.models import User
from userprofile.models import Profile

class FriendshipSerializer(serializers.ModelSerializer):
    user1_username = serializers.SerializerMethodField()
    user2_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Friendship
        fields = ['id', 'user1', 'user1_username', 'user2', 'user2_username', 'status', 'date_added']

    def get_user1_username(self, obj):
        return obj.user1.username
    
    def get_user2_username(self, obj):
        return obj.user2.username

class UserFriendInfoSerializer(serializers.ModelSerializer):
    online_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'online_status']

    def get_online_status(self, obj):
        try:
            return obj.profile.online_status
        except Profile.DoesNotExist:
            return None