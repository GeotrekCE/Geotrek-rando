from django import dispatch


pre_sync = dispatch.Signal(providing_args=["session", "settings", "input_kwargs"])
post_sync = dispatch.Signal(providing_args=["session", "settings"])
