from django.contrib.auth.models import User
from rest_framework import serializers
import re

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name']

    def validate_username(self, value):
        # Requirements: 4-24 characters, only letters and numbers
        username_regex = r"^[a-zA-Z\d]{4,24}$"
        if not re.fullmatch(username_regex, value):
            raise serializers.ValidationError("Nickname does not meet requirements")
        return value
    
    def validate_email(self, value):
        if self.instance.profile.oauth_42_active and self.instance.email != value:
            raise serializers.ValidationError("Cannot change email when authenticated with 42")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email address is aleady in use")
        return value
