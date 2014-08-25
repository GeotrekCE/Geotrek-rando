{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

build-mbtiles-{{cfg.name}}:
  cmd.run:
    - name: bin/python ./manage.py build_mbtiles
    - cwd: {{cfg.project_root}}
    - user: {{cfg.user}}
