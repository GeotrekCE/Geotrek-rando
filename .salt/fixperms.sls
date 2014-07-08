




geotrek_services-restricted-perms:
  file.managed:
    - name: /srv/projects/geotrek_services/global-reset-perms.sh
    - mode: 750
    - user: geotrek_services-user
    - group: editor
    - contents: |
            #!/usr/bin/env bash
            if [ -e "/srv/projects/geotrek_services/pillar" ];then
            "/srv/salt/makina-states/_scripts/reset-perms.py" "${@}" \
              --dmode '0770' --fmode '0770' \
              --user root --group "editor" \
              --users root \
              --groups "editor" \
              --paths "/srv/projects/geotrek_services/pillar";
            fi
            if [ -e "/srv/projects/geotrek_services/project" ];then
              "/srv/salt/makina-states/_scripts/reset-perms.py" "${@}" \
              --dmode '0770' --fmode '0770'  \
              --paths "/srv/projects/geotrek_services/project" \
              --paths "/srv/projects/geotrek_services/data" \
              --users www-data \
              --users geotrek_services-user \
              --groups editor \
              --user geotrek_services-user \
              --group editor;
              "/srv/salt/makina-states/_scripts/reset-perms.py" "${@}" \
              --no-recursive -o\
              --dmode '0555' --fmode '0644'  \
              --paths "/srv/projects/geotrek_services/project" \
              --paths "/srv/projects/geotrek_services" \
              --paths "/srv/projects/geotrek_services"/.. \
              --paths "/srv/projects/geotrek_services"/../.. \
              --users www-data ;
            fi
  cmd.run:
    - name: /srv/projects/geotrek_services/global-reset-perms.sh
    - cwd: /srv/projects/geotrek_services/project
    - user: root
    - watch:
      - file: geotrek_services-restricted-perms
