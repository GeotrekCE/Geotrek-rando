# -*- coding: utf8 -*-

import json

from django.http import HttpResponse
from django.template.loader import render_to_string
from django.views.generic import FormView
from .forms import FeedBackForm


class FeedBackView(FormView):

    template_name = 'feedback/form.html'
    form_class = FeedBackForm

    def form_valid(self, form):

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_valid(form)
        else:
            name = form.cleaned_data['name']
            email = form.cleaned_data['email']
            category = form.cleaned_data['category']
            comment = form.cleaned_data['comment']

            response = {'status': 'OK'}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')

    def form_invalid(self, form):

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_invalid(form)
        else:
            html_data = render_to_string(
                self.template_name,
                {'form': form, 'request': self.request})
            response = {'status': 'NOK', 'data': html_data}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')
