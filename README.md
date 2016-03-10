# GEOTREK RANDO V2 ![master](https://travis-ci.org/makinacorpus/Geotrek-rando.svg)
### Public portal of Geotrek (http://geotrek.fr).


## PREREQUISITES

- Geotrek-Rando v2 can synchronize only with Geotrek-Admin v2
- Ubuntu 14.04

### Syncronization

You have to set up a data directory on the Geotrek-Rando server and synchronize it with Geotrek-Admin data.
To do so, you have to run the Geotrek-Admin command (`<...>` has to be replaced by your actual configuration):

```
./bin/django sync_rando -v2 --url <http://url_of_my_geotrek_admin_serveur> <my_data_directory>
```

If Geotrek-Admin and Geotrek-Rando are not on the same server, you have to transfer data by your own (ftp, ssh, usb key…).
If you want to synchronize automatically every night, you can configure a cron task.
Make sure access rights will allow nginx to read all files in `<my_data_directory>`.

## INSTALL

### Set-up working environment

- Install Node

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs build-essential
```

### Download Geotrek-Rando

Download and extract latest release of Geotrek-Rando from [GitHub](https://github.com/makinacorpus/Geotrek-rando/releases/latest).

### Install modules via NPM

```
cd Geotrek-rando-*
npm install
```

### Launch distribution task

```
npm run dist
```
It will :
* create missing config files
* create translation files
* bundle all the app js files in src/rando.js
* compile sass files and bundle them in src/rando.css, src/rando-vendors.js
* bundle all vendors js files in src/vendors.js


## Configuration & customisation

_See [Settings](docs/settings.md) and [JSON settings](docs/settings-custom-json.md)_


## EXPORT DATA FROM GEOTREK-RANDO

### Install and configure nginx

Create the file `/etc/nginx/site-available/geotrek-rando` and symlink it to
`/etc/nginx/site-enabled/geotrek-rando`. This example supposes you synchronized
Geotrek-Admin data to `<my_data_directory>` and you configured Geotrek-Rando
`API_URL` to your `http://<my_server_name>/data`.

be carefull with trailing slashes. They are important and change the behaviour of nginx.

```
server {
    listen 80;
    server_name <my_server_name>;
    root <my_installation_directory>/src;
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

## DEVELOPMENT

### Launch bundling and watching task

```
npm run watch
```
Launch the app on localhost:3000 and watch for any change in sass or js files in src folder :
* Each time a sass file is changed, the wole css is reinjected
* Each time a js, json, or po file is saved, the browser's tab is refreshed
* Will alow you to change your config file without needing to relaunch gulp


## AUTHORS

* [Simon Bats](https://github.com/SBats)
* [Gaël Utard](https://github.com/gutard)
* [Benjamin Marguin](https://github.com/mabhub)
* [Laurent Saint-Félix](https://github.com/Anaethelion)

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)


## LICENCE

* OpenSource - BSD
