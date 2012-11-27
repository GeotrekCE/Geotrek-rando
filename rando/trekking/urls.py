from django.conf.urls import patterns, include, url
from .views import HomeView

urlpatterns = patterns('',
    url(r'^$', HomeView.as_view()),
)
