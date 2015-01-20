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

### Launch gulp distribution task
```
gulp --dist
```
It will bundle all vendors js files in vendors.js and all the app js files in rando.js

# DEVELOPMENT

### Launch gulp bundling and watching task
```
gulp
```
Launch the app on localhost:3000 and watch for any change in sass or js files in src folder :
* Each time a sass file is changed, the wole css is reinjected
* Each time a js file is saved, the browser's tab is refreshed


# CREDITS


# AUTHORS

* [Simon Bats](https://github.com/SBats)

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)

# LICENCE

* OpenSource - BSD

[<img src="http://depot.makina-corpus.org/public/logo.gif">](http://www.makina-corpus.com)
