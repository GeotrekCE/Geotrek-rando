# GEOTREK RANDO V2 ![master](https://img.shields.io/travis/makinacorpus/Geotrek-rando/master.svg?label=master)
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
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install nodejs build-essential
```

### Install Gulp-cli

```
cd
npm install gulp-cli
```

### Download Geotrek-Rando

Download and extract latest release of Geotrek-Rando from [GitHub](https://github.com/makinacorpus/Geotrek-rando/releases/latest).

### Install modules via NPM

```
cd Geotrek-rando-*
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


## CONFIGURATION

*Please be aware that you need to run the gulp task `gulp --dist` again (or use development mode) in order for changes to be visible*

### Minimum required

Those change are done in the `configs.js` file in `src/app/config/`.

1 - `PLATFORM_ID`: unique id used to represent your platorm. You need to change it, otherwise you may have conflict with other geotrek deployments. It's used for favorites and othe things specific to your platforms.
2 - `API_URL`: Url where Geotrek-rando will get data (eg, the url of Geotrek-Rando followed by `/data`).
3 - `ENABLE_HTML_MODE`: tells AngularJS if it should use the HTML5 history API (and remove the # from the url) or not.
If you want to use HTML5 mode (`ENABLE_HTML_MODE = true`), you need to configure your server accordingly to [those settings](https://github.com/angular-ui/ui-router/wiki/Frequently-Asked-Questions#how-to-configure-your-server-to-work-with-html5mode).


### Style override

You can override style by creating or editting the `_custom-override.scss` file in the `src/app/custom/styles` folder. It's loaded after every other stylesheet so you can basically do whatever you want. It's a SASS styling file.


### Customisation of Header

1 - Create or edit the file `custom-header` in the `src/app/custom/templates` folder.

2 - Add the file name to the `HEADER_TEMPLATE_FILE` var in the `src/app/config/configs.js` file.

3 - you can stylize it by edditing the `_custom-header.scss` file in `src/app/custom/styles`. (SASS file imported in `_custom.scss`_).


### Customisation of Footer

1 - Create or edit the file `custom-footer` in the `src/app/custom/templates` folder.

2 - Add the file name to the `FOOTER_TEMPLATE_FILE` var in the `src/app/config/configs.js` file.

3 - if you haven't, you ned to set `SHOW_FOOTER` to **true** for the Home page to display.

4 - you can stylize it by edditing the `_custom-footer.scss` file in `src/app/custom/styles`. (SASS file imported in `_custom.scss`_).


### Customisation of Home page

1 - Create or edit the file `custom-home-lang` in the `src/app/custom/templates` folder, replacing lang with the code of the language you want (ex: `custom-home-fr`).

2 - Add the file name to the corresponding lang of the object `HOME_TEMPLATE_FILE` in the `src/app/config/configs.js` file.

3 - if you haven't, you ned to set `SHOW_HOME` to true for the Home page to display.

4 - you can stylize it by edditing the `_custom-home.scss` file in `src/app/custom/styles`. (SASS file imported in `_custom.scss`_).


### Create custom Angular elements

Geotrek-rando allow you to create custom directives, controllers, and services which will be pluggable in your custom templates.
You can find those files in `src/app/custom` folder. They're called respectively `controllers.js`, `directives.js`, and `services.js`.
If they don't exist (mening you've never launch gulp before), you can copy the file with the extension `.example` and remove this extension. (ex: `controllers.js.example` -> `controllers.js`). It's located in the samed folder.

Each example file contain the strict minimum code in order to allows you to add custom directives, controllers or services. You'll also find a commented exemple of how you should create them.


### Add and use custom images or fonts

Basically, any image or font you would like to use should go into `images/custom`. Thent you can either use it in a template or a stylesheet, or in the config if it's, for example, the main logo of your Geotrek-rando version.


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
    types {
        application/json geojson;
        application/gpx+xml gpx;
        application/vnd.google-earth.kmz kmz;
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
* [Laurent Saint-Félix](https://github.com/Anaethelion)

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)


## LICENCE

* OpenSource - BSD
