# -*- coding: utf8 -*-

import json

from django.core.mail import send_mail
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from django.views.generic import FormView
from .forms import FeedBackForm
from rando.trekking.views import TrekView
from rando.trekking.models import Trek


class LeafletView(TrekView):
    template_name = 'feedback/leaflet_geotrek.html'


class TrekContextMixin(object):

    def get_object(self):
        slug = self.kwargs.get('slug', None)
        lang = self.request.LANGUAGE_CODE
        for trek in Trek.objects.filter(language=lang).all():
            if trek.properties.slug == slug:
                return trek
        raise Http404

    def get_context_data(self, **kwargs):
        obj = self.get_object()
        context = super(TrekContextMixin, self).get_context_data(**kwargs)
        context['trek'] = obj
        context['thumbnail'] = self.request.build_absolute_uri(
            obj.properties.thumbnail)

        pois = obj.pois.all()
        context['pois'] = pois

        # Merge pictures of trek and POIs
        all_pictures = obj.properties.pictures
        for poi in pois:
            all_pictures.extend(poi.properties.pictures)
        context['all_pictures'] = all_pictures

        return context


class FeedBackView(TrekContextMixin, FormView):

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
        self._send_mail(**data)

        if not self.request.is_ajax():
            return super(FeedBackView, self).form_valid(form)
        else:
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
