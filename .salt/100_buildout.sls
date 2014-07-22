{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

{{cfg.name}}-buildout:
  file.managed:
    - name: {{cfg.project_root}}/salt.cfg
    - source: salt://makina-projects/{{cfg.name}}/files/salt.cfg
    - template: jinja
    - user: {{cfg.user}}
    - data: |
            {{scfg}}
    - group: {{cfg.group}}
    - makedirs: true
  buildout.installed:
    - config: salt.cfg
    - name: {{cfg.project_root}}
    - user: {{cfg.user}}
    - use_vt: true
    - output_loglevel: info
    - watch:
      - file: {{cfg.name}}-buildout
    - user: {{cfg.user}}
    - group: {{cfg.group}}
