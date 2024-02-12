from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path
from authentication import views

urlpatterns = [
        path('auth/token', views.authenticate),
        path('auth/refresh', views.refresh)
        ]

urlpattenrs = format_suffix_patterns(urlpatterns);
