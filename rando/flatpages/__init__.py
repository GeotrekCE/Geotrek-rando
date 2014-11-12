from rando.core.signals import pre_sync

from rando.flatpages.sync import sync_content_flatpages


pre_sync.connect(sync_content_flatpages,  dispatch_uid='rando.flatpages.sync')
