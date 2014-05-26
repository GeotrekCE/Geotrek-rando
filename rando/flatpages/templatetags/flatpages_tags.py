from django import template

from rando.flatpages.models import FlatPage


register = template.Library()


class FlatpageNode(template.Node):
    def __init__(self, context_name):
        self.context_name = context_name

    def render(self, context):
        lang = context['request'].LANGUAGE_CODE
        flatpages = FlatPage.objects.filter(language=lang).all()
        context[self.context_name] = flatpages
        return ''


@register.tag
def get_flatpages(parser, token):
    """
    Example usage::

        {% get_flatpages as flatpages %}
    """
    bits = token.split_contents()
    syntax_message = ("%(tag_name)s expects a syntax of %(tag_name)s "
                       "as context_name" %
                       dict(tag_name=bits[0]))
   # Must have at 3-6 bits in the tag
    if len(bits) >= 3 and len(bits) <= 6:
        # The very last bit must be the context name
        if bits[-2] != 'as':
            raise template.TemplateSyntaxError(syntax_message)
        context_name = bits[-1]
        return FlatpageNode(context_name)
    else:
        raise template.TemplateSyntaxError(syntax_message)
