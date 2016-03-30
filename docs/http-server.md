# Geotrek-rando documentation

‹ Back to [README](README.md)

## Install and configure nginx

Create the file `/etc/nginx/site-available/geotrek-rando` and symlink it to
`/etc/nginx/site-enabled/geotrek-rando`. This example supposes you synchronized
Geotrek-Admin data to `<my_data_directory>` and you configured Geotrek-Rando
`API_URL` to your `http://<my_server_name>/data`.

be carefull with trailing slashes. They are important and change the behaviour of nginx.

```
server {
    listen 80;
    server_name <my_server_name>;
    root <my_installation_directory>/public;
    if_modified_since before;
    expires 1h;
    gzip on;
    gzip_types text/text text/html text/plain text/xml text/css application/x-javascript application/javascript application/json;
    include mime.types;
    types {
        application/json geojson;
        application/gpx+xml gpx;
        application/vnd.google-earth.kmz kmz;
        application/x-font-ttf ttf;
    }
    location /data/ {
        root <my_data_directory>/;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then run `service nginx restart`

### Redirect URLs from v1

In nginx configuration file inside `server {...}` section, add:

```
    rewrite ^/fr/pages/(.+)$ http://<your.domain.com>/informations/$1/ permanent;
    rewrite ^/fr/(.+)$ http://<your.domaine.com>/<practice-slug>/$1/ permanent;
    rewrite ^/fr/$ http://<your.domaine.com> permanent;
```

And replace <your.domaine.com> by your domain and <practice-slug> by the slug of your practice (check new urls of treks to get it).
All treks will be redirected to this unique practice as it is not possible to distinguish practices in v1 urls.
