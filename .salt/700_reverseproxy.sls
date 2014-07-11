{% import "makina-states/services/monitoring/circus/macros.jinja" as circus with context %}
{% import "makina-states/services/http/nginx/init.sls" as nginx %}

{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

include:
  - makina-states.services.http.nginx
  - makina-states.services.monitoring.circus

# inconditionnaly reboot circus & nginx upon deployments
/bin/true:
  cmd.run:
    - watch_in:
      - mc_proxy: nginx-pre-conf-hook
      - mc_proxy: circus-pre-conf

{% set circus_data = {
    'cmd': 'bin/gunicorn -w {2} -b {0}:{1} {3}'.format(
      data.host, data.port, data.workers, data.WSGI
  ),
  'environment': {'DJANGO_SETTINGS_MODULE': cfg.data.DJANGO_SETTINGS_MODULE},
  'uid': cfg.user,
  'gid': cfg.group,
  'copy_env': True,
  'working_dir': cfg.project_root,
  'warmup_delay': "10",
  'max_age': 24*60*60}%}

{{ circus.circusAddWatcher(cfg.name, **circus_data) }}

{{ nginx.virtualhost(domain=data.domain, doc_root=cfg.data_root+'/static',
                     server_aliases=data.server_aliases,
                     vh_top_source=data.nginx_upstreams,
                     vh_content_source=data.nginx_vhost,
                     cfg=cfg)}}
