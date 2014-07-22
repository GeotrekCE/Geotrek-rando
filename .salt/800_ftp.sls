{% set cfg = opts.ms_project %}
{% set data = cfg.data %}
{% set scfg = salt['mc_utils.json_dump'](cfg) %}

include:
  - makina-states.services.ftp.pureftpd

{% for usersrow in data.ftpusers %}
{% for user, data in usersrow.items() %}
user-{{cfg.name}}-{{user}}:
  user.present:
    - name: {{user}}
    - home: {{cfg.data_root}}/input
    - groups: [{{cfg.group}}]
    - password: {{salt['mc_utils.unix_crypt'](data.pass)}}
    - shell: /bin/ftponly
{% endfor %}
{% endfor %}


/etc/pure-ftpd/conf/PassivePortRange:
  file.managed:
    - makedirs: true
    - contents: {{data.ftp_port_range}}
    - watch_in:
      - mc_proxy: ftpd-post-configuration-hook
{% if data.ftp_ip %}
/etc/pure-ftpd/conf/ForcePassiveIP:
  file.managed:
    - makedirs: true
    - contents: {{data.ftp_ip}}
    - watch_in:
      - mc_proxy: ftpd-post-configuration-hook
{% endif %}
