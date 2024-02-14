from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from userprofile import views

urlpatterns = [
        path('api/userinfo/', views.user_info),
        path('api/updateprofile/', views.update_profile),
        path('api/uploadimage/', views.upload_image),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)