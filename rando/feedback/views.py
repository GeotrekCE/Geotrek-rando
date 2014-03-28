
import json

from django.core.mail import mail_managers
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django.views.generic import FormView

from rando import logger
from .forms import FeedBackForm


class FeedBackView(FormView):

    template_name = 'feedback/form.html'
    mail_template_name = 'feedback/mail_template.html'
    form_class = FeedBackForm

    def _send_mail(self, **kwargs):
        subject = _(u'Feedback from {name}').format(name=kwargs['name'])
        message = render_to_string(
            self.mail_template_name, kwargs)

        mail_managers(subject, message, fail_silently=False)

    def form_valid(self, form):
        category_val = form.cleaned_data['category']
        data = dict(
            name=form.cleaned_data['name'],
            email=form.cleaned_data['email'],
            category=dict(form.fields['category'].choices)[category_val],
            user_comment=form.cleaned_data['comment'],
            latitude=form.cleaned_data['latitude'],
            longitude=form.cleaned_data['longitude'],
        )

        # Send mail to administrator
        try:
            self._send_mail(**data)
        except Exception as e:
            logger.error('Error when sending email')
            logger.exception(e)
            response = {'status': 'EMAIL_SENDING_FAILED'}
            return HttpResponse(json.dumps(response),
                                content_type='application/json')

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_valid(form)
        else:
            response = {'status': 'EMAIL_SENDING_OK'}
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
