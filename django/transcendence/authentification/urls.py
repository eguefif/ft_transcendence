from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from authentification import views

urlpatterns = [
        path('api/login/', views.LoginView.as_view()),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)