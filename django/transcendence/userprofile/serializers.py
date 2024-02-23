from django.contrib.auth.models import User
from rest_framework import serializers
import re

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email']

    def validate_username(self, value):
        # Requirements: 4-24 characters, only letters and numbers
        username_regex = r"^[a-zA-Z\d]{4,24}$"
        if not re.fullmatch(username_regex, value):
            raise serializers.ValidationError("Nickname does not meet requirements")
        return value