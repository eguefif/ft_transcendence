from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from gamesManager import views


from usrProfile import views


urlpatterns = [
        path('profile/getprofile', views.get_profile),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)

