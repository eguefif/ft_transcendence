from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def authenticate(request, format=None):
    return Response({"user": "hi"},
                    status=status.HTTP_200_OK)

@api_view(['GET'])
def refresh(request, format=None):
    return Response({"user": "hello"},
                    status=status.HTTP_200_OK)

