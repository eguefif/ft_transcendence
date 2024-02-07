from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from register import views

urlpatterns = [
        path('dj/register/', views.RegisterView.as_view()),
        ]

urlpatterns = format_suffix_patterns(urlpatterns)

