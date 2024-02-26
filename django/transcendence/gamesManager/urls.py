from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns


from gamesManager import views


urlpatterns = [
        path('game/creategame', views.create_game),
        path('game/endgame', views.end_game),
        path('game/dropgame', views.drop_game),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)

