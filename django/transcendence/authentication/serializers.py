from django.contrib.auth.models import User
from rest_framework import serializers
import re


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
    
    def validate_username(self, value):
        # Requirements: 4-24 characters, only letters and numbers
        username_regex = r"^[a-zA-Z\d]{4,24}$"
        if not re.fullmatch(username_regex, value):
            raise serializers.ValidationError("Nickname does not meet requirements")
        return value

    def validate_password(self, value):
        # Requirements: 4-24 characters, at least one uppercase, one lowercase and one number
        password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{4,24}$"
        if not re.fullmatch(password_regex, value):
            raise serializers.ValidationError("Password does not meet requirements")
        return value

class UserNoPasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
