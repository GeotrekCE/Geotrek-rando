# GEOTREK RANDO V2 ![master](https://img.shields.io/travis/makinacorpus/Geotrek-rando/master.svg?label=master)
### Public portal of Geotrek (http://geotrek.fr).

## PREREQUISITES

Geotrek-Rando v2 can synchronize only with Geotrek-Admin >= v2.0.0

## INSTALL

Clone the current repository and then:

### Install NPM
```
npm install
```

### Launch gulp distribution task
```
gulp --dist
```
It will :
* create missing config files
* create translation files
* bundle all the app js files in src/rando.js
* compile sass files and bundle them in src/rando.css, src/rando-vendors.js
* bundle all vendors js files in src/vendors.js 

### Configure the app

Minimum config: 
1 - change the `PLATFORM_ID` at the top of the previously created `config.js` file with a *unique id* as it will be used for localStorage.

Then run `gulp --dist` again.

### Export data from Geotrek-Rando

### Install and configure nginx

Create the file `/etc/nginx/site-available/geotrek-rando` and symlink it to
`/etc/nginx/site-enabled/geotrek-rando`.

```
server {
    listen 80;
    server_name <my server name>;
    root <where I cloned repository>/src;
    if_modified_since before;
    expires 1h;
    gzip on;
    gzip_types text/text text/html text/plain text/xml text/css application/x-javascript application/javascript application/json;
    types {
        application/json geojson;
        application/gpx+xml gpx;
        application/vnd.google-earth.kmz kmz;
    }
    location /data/ {
        root <where I export>;
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Then run `service nginx restart`

## DEVELOPMENT

### Launch gulp bundling and watching task

```
gulp
```
Launch the app on localhost:3000 and watch for any change in sass or js files in src folder :
* Each time a sass file is changed, the wole css is reinjected
* Each time a js file is saved, the browser's tab is refreshed
* Will alow you to change your config file without needing to relaunch gulp

Options :
```
--vendors
```
-> Will also bundle vendors on first launch. You need to do it the first time you launch the dev version if you haven't done any gulp --dist before. 

Please note that you currently need to force CORS request in your browser in order to get data from our test server.

## AUTHORS

* [Simon Bats](https://github.com/SBats)
* [Gaël Utard](https://github.com/gutard)
* [Benjamin Marguin](https://github.com/mabhub)

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)

## LICENCE

* OpenSource - BSD