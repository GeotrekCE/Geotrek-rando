
from django.conf.urls import patterns, url
from .views import FeedBackView


urlpatterns = patterns(
    '',
    url(r'feedback/$', FeedBackView.as_view(), name='feedback_view'),
)
