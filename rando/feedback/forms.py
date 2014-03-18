
from captcha.fields import ReCaptchaField

from django import forms
from django.conf import settings
from django.forms.widgets import Textarea
from django.utils.translation import get_language, ugettext_lazy as _


class FeedBackForm(forms.Form):

    categories = (
        ('SO', 'Sophomore'),
        ('JR', 'Junior'),
        ('SR', 'Senior'),
    )

    name = forms.CharField(max_length=200, label=_('Name'))
    email = forms.EmailField(max_length=200, label=_('Email'))
    category = forms.ChoiceField(categories, label=_('Category'))

    comment = forms.CharField(widget=Textarea(
        attrs={'rows': 3, 'cols': 50,
               'placeholder': _(u'Description of your problem')}),
        label=_('Description'))

    latitude = forms.FloatField(required=False, label=_(u'Lat'))
    longitude = forms.FloatField(required=False, label=_(u'Lng'))

    captcha = ReCaptchaField(label=_(u'Captcha'))

    def __init__(self, *args, **kwargs):

        super(FeedBackForm, self).__init__(*args, **kwargs)

        categories = settings.FEEDBACK_FORM_CATEGORIES.get(
            get_language(),
            settings.FEEDBACK_FORM_CATEGORIES.get(settings.LANGUAGE_CODE, ''))

        self.fields['category'].choices = categories
