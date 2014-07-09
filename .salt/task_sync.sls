{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

static-{{cfg.name}}:
  cmd.run:
    - name: make sync
    - cwd: {{cfg.project_root}}
    - user: {{cfg.user}}
