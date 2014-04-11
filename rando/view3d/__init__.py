from rando.core.signals import pre_sync

from rando.view3d.sync import sync_content_view3d


pre_sync.connect(sync_content_view3d,  dispatch_uid='rando.view3d.sync')
