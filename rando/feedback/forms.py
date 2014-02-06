# -*- coding: utf8 -*-

from django import forms
from django.forms.widgets import Textarea


class FeedBackForm(forms.Form):

    categories = (
        ('SO', 'Sophomore'),
        ('JR', 'Junior'),
        ('SR', 'Senior'),
    )

    name = forms.CharField(max_length=200)
    email = forms.EmailField(max_length=200)
    category = forms.ChoiceField(categories)

    comment = forms.CharField(required=False,
                              widget=Textarea(attrs={'rows': 2}))
