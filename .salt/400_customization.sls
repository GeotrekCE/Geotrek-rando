{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

customizations-{{cfg.name}}:
  file.recurse:
    - name: {{cfg.data_root}}/input/media
    - source: {{data.media_files_source}}
    - user: {{cfg.user}}
    - data: |
            {{scfg}}
    - group: {{cfg.group}}
    - makedirs: true
