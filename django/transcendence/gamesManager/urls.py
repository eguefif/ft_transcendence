from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from register import views


from gamesManager import views


urlpatterns = [
        path('api/creategame/', views.create_game),
        path('api/endgame/', views.end_game),
        path('api/getgames/', views.get_games),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)

