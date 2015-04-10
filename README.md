# GEOTREK RANDO V2
### Public portal of Geotrek (http://geotrek.fr).
========


# OVERVIEW
V2 currently under heavy development. It steel need an old geotrek rando for data fetching.


# INSTALL

clone the current repository and then :

### Install NPM
```
npm install
```

### Create and rename custom files
1 - duplicate `src/app/config/configs-default.js` and rename it `configs.js`
Then you can chose options that suits your needs in it !
(Each time you change your config file, you need to launch gulp if you're not in dev mode.)
2 - duplicate `src/app/config/styles/_configs-default.scss` and rename it `_configs.scss`.
In this file you can override colors and font configuration of the app.
(don't forget the `_` before the name !)
3 - In `src/app/translation/po/`, rename any file ending by .example with [lang]-custom.po.
(ex: fr-custom.po.example -> fr-custom.po, en-custom.po.example -> en-custom.po)
Thos files will allow you to override any translation in [lang].po files.
4 - Create a file named `_custom-home` in the folder `src/app/home/styles/custom/`


### Config the app
To do so, you need to: 
1 - change the `PLATFORM_ID` at the top of the previously created `config.js` file with a *unique id* as it will be used for localStorage.



### Launch gulp distribution task
```
gulp --dist
```
It will :
* bundle all vendors js files in src/vendors.js 
* bundle all the app js files in src/rando.js
* compile sass files and bundle them in src/rando.css

# DEVELOPMENT

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
-> Will also bundle vendors. You need to do it the first time you launch the dev version if you haven't done any gulp --dist before. 

Please note that you currently need to force CORS request in your browser in order to get data from our test server.

# CREDITS


# AUTHORS

* [Simon Bats](https://github.com/SBats)

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)

# LICENCE

* OpenSource - BSD

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)
