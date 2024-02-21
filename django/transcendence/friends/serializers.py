from friends.models import Friendship
from rest_framework import serializers

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendship
        fields = ['id', 'user1', 'user2', 'status', 'date_added']