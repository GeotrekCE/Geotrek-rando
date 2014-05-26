from captcha.fields import ReCaptchaField

from django.forms.widgets import Select
from django import forms
from django.forms.widgets import Textarea
from django.utils.translation import get_language, ugettext_lazy as _

from rando.feedback.models import FeedbackCategory


class CategorySelect(Select):
    def render_options(self, *args, **kwargs):
        categories = FeedbackCategory.objects.filter(language=get_language()).all()
        self.choices = [(c.id, c.label) for c in categories]
        return super(CategorySelect, self).render_options(*args, **kwargs)


class FeedBackForm(forms.Form):

    name = forms.CharField(max_length=200, label=_('Name'))
    email = forms.EmailField(max_length=200, label=_('Email'))
    category = forms.CharField(label=_('Category'),
                               widget=CategorySelect)
    comment = forms.CharField(widget=Textarea(
        attrs={'rows': 3, 'cols': 50,
               'placeholder': _(u'Description of your problem')}),
        label=_('Description'))

    latitude = forms.FloatField(required=False, label=_(u'Lat'))
    longitude = forms.FloatField(required=False, label=_(u'Lng'))

    captcha = ReCaptchaField(label=_(u'Captcha'))
