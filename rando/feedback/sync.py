from django.conf import settings

from rando.core.management.commands.sync_content import InputFile
from rando.feedback.models import FeedbackCategory
from rando import logger


def sync_content_feedback(sender, **kwargs):
    if not settings.FEEDBACK_FORM_ENABLED:
        return

    server_settings = kwargs['server_settings']
    inputkw = kwargs['input_kwargs']

    languages = server_settings.languages.available.keys()
    logger.debug("Languages: %s" % languages)
    for language in languages:
        inputkwlang = dict(language=language, **inputkw)
        InputFile(FeedbackCategory.filepath, **inputkwlang).pull_if_modified()
