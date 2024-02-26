from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from friends import views

urlpatterns = [
        path('send_friend_request/', views.send_friend_request),
        path('get_friend_requests/', views.get_friend_requests),
        path('get_friend_list/', views.get_friend_list),
        path('accept_friend_request/', views.accept_friend_request),
        path('decline_friend_request/', views.decline_friend_request),
        path('delete_friendship/', views.delete_friendship),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)