from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from userprofile import views

urlpatterns = [
        path('userinfo/', views.user_info),
        path('updateprofile/', views.update_profile),
        path('uploadimage/', views.upload_image),
        path('userpicture/', views.user_picture),
        path('u/<str:username>', views.user_stats),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)