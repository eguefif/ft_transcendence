from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from userprofile import views

urlpatterns = [
        path('/profile/userinfo/', views.user_info),
        path('/profile/updateprofile/', views.update_profile),
        path('/profile/uploadimage/', views.upload_image),
        path('/profile/userpicture/', views.user_picture),
        path('profile/getprofile', views.get_profile),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)
