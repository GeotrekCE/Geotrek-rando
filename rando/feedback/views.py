# -*- coding: utf8 -*-

from django.views.generic import FormView
from .forms import FeedBackForm


class FeedBackView(FormView):

    template_name = 'feedback/form.html'
    form_class = FeedBackForm

    def form_valid(self, form):

        print('form_valid')

        return super(FeedBackView, self).form_valid(self, form)
