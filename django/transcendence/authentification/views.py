from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from rest_framework import permissions, views
from rest_framework.response import Response

from . import serializers

class LoginView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = serializers.UserAuthSerializer(data=self.request.data, context={ 'request': self.request })
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user)
        return Response(None, status=status.HTTP_202_ACCEPTED)