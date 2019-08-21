# Geotrek-rando documentation

‹ Back to [README](README.md)

## Install and configure nginx

Create the file `/etc/nginx/sites-available/geotrek-rando` and symlink it to
`/etc/nginx/sites-enabled/geotrek-rando`. This example supposes you synchronized
Geotrek-Admin data to `<my_data_directory>` and you configured Geotrek-Rando
`API_URL` to your `''` (empty string).

be carefull with trailing slashes. They are important and change the behaviour of nginx.

```
server {
    listen 80;
    server_name <my_server_name>;
    root <my_installation_directory>/public;
    if_modified_since before;
    expires 1h;
    gzip on;
    gzip_types text/text text/plain text/xml text/css application/x-javascript application/javascript application/json;
    include mime.types;
    types {
        application/json geojson;
        application/gpx+xml gpx;
        application/x-font-ttf ttf;
    }
    # Uncomment below for mobile v3 API
    # location ~ ^/mobile/(.*)$ {
    #     add_header Access-Control-Allow-Origin "*";
    #     add_header Access-Control-Allow-Methods "GET, OPTIONS";
    #     root <my_mobile_directory>/;
    #     try_files /$http_accept_language/$1 /nolang/$1 =404;
    # }
    location ~ ^/(api|media|static|zip|meta)/ {
        root <my_data_directory>/;
    }
    location / {
        try_files $uri @angular;
    }
    location @angular {
        if ($http_user_agent ~* "googlebot|yahoo|bingbot|baiduspider|yandex|yeti|yodaobot|gigabot|ia_archiver|facebookexternalhit|twitterbot|developers\.google\.com") {
            rewrite .* /meta/fr$uri/index.html last;
        }
        try_files /index.html =404;
    }
}
```

Then run `sudo service nginx restart`

### Force PDF download for Firefox

Firefox PDF viewer does not display images nor maps, to avoid this download PDF can be forced in nginx configuration.

```
location ~ /api/.*([^/]+\.pdf)$ {
    root <my_data_directory>/;
    if ($http_user_agent ~* firefox) {
        add_header Content-Disposition 'attachment; filename="$1"';
    }
}
```

### Redirect URLs from v1

In nginx configuration file inside `server {...}` section, add:

```
    rewrite ^/fr/pages/(.+)$ http://<your.domain.com>/informations/$1/ permanent;
    rewrite ^/fr/(.+)$ http://<your.domaine.com>/<practice-slug>/$1/ permanent;
    rewrite ^/fr/$ http://<your.domaine.com> permanent;
```

And replace <your.domaine.com> by your domain and <practice-slug> by the slug of your practice (check new urls of treks to get it).
All treks will be redirected to this unique practice as it is not possible to distinguish practices in v1 urls.
