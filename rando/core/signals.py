from django import dispatch


pre_sync = dispatch.Signal(providing_args=["client", "settings", "input_kwargs"])
post_sync = dispatch.Signal(providing_args=["client", "settings"])
