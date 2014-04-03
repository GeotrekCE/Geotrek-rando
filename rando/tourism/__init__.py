from rando.core.signals import pre_sync

from rando.tourism.sync import sync_content_tourism


pre_sync.connect(sync_content_tourism,  dispatch_uid='rando.tourism.sync')
