from django.urls import path
from . import views

urlpatterns = [
    path("analyze/", views.analyze_skin, name="analyze_skin"),
]