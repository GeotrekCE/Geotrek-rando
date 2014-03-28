from rando.core.signals import pre_sync

from rando.trekking.sync import sync_content_trekking


pre_sync.connect(sync_content_trekking,  dispatch_uid='rando.trekking.sync')
