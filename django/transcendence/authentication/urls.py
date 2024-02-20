from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path
from authentication import views

urlpatterns = [
        path('auth/token', views.authenticate),
        path('auth/refresh', views.refresh),
        path('auth/logout', views.logout),
        path('auth/otp/login', views.otp),
        path('auth/otp/activate', views.otp_activate),
        path('auth/otp/deactivate', views.otp_deactivate)
        ]

urlpattenrs = format_suffix_patterns(urlpatterns);
