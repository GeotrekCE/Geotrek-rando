# -*- coding: utf8 -*-

import json

from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django.views.generic import FormView
from .forms import FeedBackForm


class FeedBackView(FormView):

    template_name = 'feedback/form.html'
    mail_template_name = 'feedback/mail_template.html'
    form_class = FeedBackForm

    def _send_mail(self, **kwargs):

        subject = _(u'Feedback from {email}').format(email=kwargs['email'])
        message = render_to_string(
            self.mail_template_name, kwargs)

        from_mail = 'from@example.com'
        to_mail = ['to@example.com']
        send_mail(subject, message, from_mail, to_mail, fail_silently=False)

    def form_valid(self, form):

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_valid(form)
        else:
            category_val = form.cleaned_data['category']
            data = dict(
                name=form.cleaned_data['name'],
                email=form.cleaned_data['email'],
                category=dict(form.fields['category'].choices)[category_val],
                user_comment=form.cleaned_data['comment'],
            )

            # Send mail to administrator
            self._send_mail(**data)

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
