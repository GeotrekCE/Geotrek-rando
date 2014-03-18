# -*- coding: utf8 -*-

from captcha.fields import ReCaptchaField

from django import forms
from django.forms.widgets import Textarea
from django.utils.translation import ugettext_lazy as _


class FeedBackForm(forms.Form):

    categories = (
        ('SO', 'Sophomore'),
        ('JR', 'Junior'),
        ('SR', 'Senior'),
    )

    name = forms.CharField(max_length=200)
    email = forms.EmailField(max_length=200)
    category = forms.ChoiceField(categories)

    comment = forms.CharField(widget=Textarea(
        attrs={'rows': 3, 'cols': 50,
               'placeholder': _(u'Description of your problem')}))

    latitude = forms.FloatField(required=False, label=_(u'Lat'))
    longitude = forms.FloatField(required=False, label=_(u'Lng'))

    captcha = ReCaptchaField()
