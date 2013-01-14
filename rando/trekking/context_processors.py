from .models import Trek, Settings


def settings(request):
    lang = request.LANGUAGE_CODE
    return {
        'settings' : Settings.objects.all(),
        # We want the treks list to be initialized from everywhere
        'treksjson' : Trek.objects.filter(language=lang).content,
    }