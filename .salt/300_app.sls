{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

{{cfg.name}}-config:
  file.managed:
    - name: {{cfg.project_root}}/rando/settings/prod.py
    - source: salt://makina-projects/{{cfg.name}}/files/config.py
    - template: jinja
    - user: {{cfg.user}}
    - data: |
            {{scfg}}
    - group: {{cfg.group}}
    - makedirs: true

static-{{cfg.name}}:
  cmd.run:
    - name: {{cfg.project_root}}/bin/django-admin.py collectstatic --noinput --settings="{{data.DJANGO_SETTINGS_MODULE}}"
    - cwd: {{cfg.project_root}}
    - user: {{cfg.user}}
    - watch:
      - file: {{cfg.name}}-config

#syncdb-{{cfg.name}}:
#  cmd.run:
#    - name: {{cfg.project_root}}/bin/django-admin.py syncdb --noinput
#    - cwd: {{cfg.project_root}}
#    - user: {{cfg.user}}
#    - use_vt: true
#    - output_loglevel: info
#    - watch:
#      - file: {{cfg.name}}-config

# {% for dadmins in data.admins %}
# {% for admin, udata in dadmins.items() %}
# user-{{cfg.name}}-{{admin}}:
#   cmd.run:
#     - name: {{cfg.project_root}}/bin/django-admin.py createsuperuser --username="{{admin}}" --email="{{udata.mail}}" --noinput
#     - unless: {{cfg.project_root}}/bin/mypy -c "from django.contrib.auth.models import User;User.objects.filter(username='{{admin}}')[0]"
#     - cwd: {{cfg.project_root}}
#     - user: {{cfg.user}}
#     - watch:
#       - file: {{cfg.name}}-config
# 
# 
# superuser-{{cfg.name}}-{{admin}}:
#   file.managed:
#     - contents: |
#                 from django.contrib.auth.models import User
#                 user=User.objects.filter(username='{{admin}}').first()
#                 user.set_password('{{udata.password}}')
#                 user.save()
#     - mode: 600
#     - user: {{cfg.user}}
#     - group: {{cfg.group}}
#     - source: ""
#     - name: "{{cfg.project_root}}/salt_{{admin}}_password.py"
#     - watch:
#       - file: {{cfg.name}}-config
#   cmd.run:
#     - name: {{cfg.project_root}}/bin/mypy "{{cfg.project_root}}/salt_{{admin}}_password.py"
#     - cwd: {{cfg.project_root}}
#     - user: {{cfg.user}}
#     - watch:
#       - cmd: user-{{cfg.name}}-{{admin}}
#       - file: superuser-{{cfg.name}}-{{admin}}
# {%endfor %}
# {%endfor %}

make_sync-{{cfg.name}}:
  cmd.run: 
    - name: make sync
    - cwd: {{cfg.project_root}}
    - user: {{cfg.user}}
    - watch:
      - cmd: static-{{cfg.name}}

{% if data.sync_periodicity %}
scron-make-sync:
  file.managed:
    - watch:
      - cmd: static-{{cfg.name}}
    - name: {{cfg.data_root}}/sync.sh 
    - mode: 750
    - contents: |
                #!/usr/bin/env bash
                LOG="{{cfg.data_root}}/sync.log"
                lock="${0}.lock"
                if [ -e "${lock}" ];then
                  echo "Locked ${0}";exit 1
                fi
                touch "${lock}"
                salt-call --out-file="${LOG}" --retcode-passthrough -lall --local mc_project.run_task {{cfg.name}} task_sync 1>/dev/null 2>/dev/null
                ret="${?}"
                rm -f "${lock}"
                if [ "x${ret}" != "x0" ];then
                  cat "${LOG}"
                fi
                exit "${ret}"
cron-make-sync:
  file.managed:
    - watch:
      - cmd: static-{{cfg.name}}
    - name: /etc/cron.d/randosync
    - mode: 750
    - contents: |
                MAILTO={{data.sync_mail}}
                {{data.sync_periodicity}} root {{cfg.data_root}}/sync.sh
{% endif %}
