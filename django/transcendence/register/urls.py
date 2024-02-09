from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from register import views

urlpatterns = [
        path('api/register/', views.register),
        path('api/login/', views.login),
        path('api/logout/', views.logout),
        path('api/is_token_valid/', views.is_token_valid),
        path('api/userinfo/', views.user_info),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)

