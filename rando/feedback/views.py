import json

from django.http import HttpResponse
from django.template.loader import render_to_string
from django.views.generic import FormView

from rando import logger
from .forms import FeedBackForm
from . import helpers as feedback_helpers


class FeedBackView(FormView):

    template_name = 'feedback/form.html'
    form_class = FeedBackForm

    def form_valid(self, form):
        try:
            feedback_helpers.send_report(**form.cleaned_data)
        except Exception as e:
            logger.error('Error when sending report')
            logger.exception(e)
            response = {'status': 'REPORT_FAILED'}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_valid(form)
        else:
            response = {'status': 'REPORT_OK'}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')

    def form_invalid(self, form):
        if not self.request.is_ajax():
            return super(FeedBackView, self).form_invalid(form)
        else:
            html_data = render_to_string(
                self.template_name,
                {'form': form, 'request': self.request})
            response = {'status': 'FORM_INVALID', 'data': html_data}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')
