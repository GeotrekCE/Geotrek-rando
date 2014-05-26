from rando.core.signals import pre_sync

from rando.feedback.sync import sync_content_feedback


pre_sync.connect(sync_content_feedback,  dispatch_uid='rando.feedback.sync')
