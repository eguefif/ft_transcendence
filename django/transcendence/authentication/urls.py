from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path
from authentication import views

urlpatterns = [
        path('auth/token', views.authenticate),
        path('auth/refresh', views.refresh),
        path('auth/logout', views.logout),
        path('auth/otp/login', views.otp),
        path('auth/otp/activate', views.otp_activate),
        path('auth/otp/activate/confirm', views.otp_activate_confirm),
        path('auth/otp/deactivate', views.otp_deactivate),
        path('auth/oauth/42', views.oauth_42),
        path('auth/oauth/42/login', views.login_42),
        path('auth/oauth', views.oauth)
        ]

urlpattenrs = format_suffix_patterns(urlpatterns);
