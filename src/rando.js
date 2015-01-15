(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/app/app.js":[function(require,module,exports){
'use strict';

var dependencies = [
    // Our submodules
    'rando.config', 'rando.treks', 'rando.layout', 'rando.map',

    // External stuff
    'ui.router', 'ngResource'
];

angular.module('geotrekRando', dependencies);

// Require Geotrek components
require('./config');
//require('./commons');
require('./layout');
require('./treks');
require('./map');

},{"./config":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/index.js","./layout":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/index.js","./map":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/index.js","./treks":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/index.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js":[function(require,module,exports){
'use strict';

function settingsFactory(globalSettings) {

    // CONSTANTS VAR that user can change
    //
    var DOMAIN = 'http://192.168.100.47:8888',

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        TILES_DIR = 'tiles',

        TREKS_FILE = 'trek.geojson',
        //POI_FILE = 'pois.geojson',

        LEAFLET_BACKGROUND_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

        LEAFLET_CONF = {
            CENTER_LATITUDE: 44.83,
            CENTER_LONGITUDE: 6.34,
            DEFAULT_ZOOM: 12,
            DEFAULT_MIN_ZOOM: 8,
            DEFAULT_MAX_ZOOM: 16,
            ATTRIBUTION: '(c) IGN Geoportail',
            TREK_COLOR: '#F89406'
        };

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  DOMAIN + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE;

    //PUBLIC METHODS
    //
    var setLang = function (newLang) {
        _activeLang = newLang;
        return true;
    };

    var getLang = function () {
        return _activeLang;
    };



    return {
        //CONSTANTS
        DOMAIN: DOMAIN,
        LEAFLET_BACKGROUND_URL: LEAFLET_BACKGROUND_URL,
        LEAFLET_CONF: LEAFLET_CONF,

        //PUBLIC VAR
        treksUrl: treksUrl,

        //METHODS
        setLang: setLang,
        getLang: getLang

    };

}

module.exports = {
    settingsFactory: settingsFactory
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.config', [])
    .constant('globalSettings', {
        DEFAULT_LANGUAGE: 'fr'
    })
    .factory('settingsFactory', require('./factories').settingsFactory);
},{"./factories":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/controllers.js":[function(require,module,exports){
'use strict';

function LayoutController($scope, treks) {
    $scope.treks = treks;
    console.log(treks);
}

function HeaderController() {
}

function SidebarController() {
}

function FooterController() {
}


module.exports = {
    LayoutController: LayoutController,
    HeaderController: HeaderController,
    SidebarController: SidebarController,
    FooterController: FooterController
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.layout', ['ui.router', 'rando.treks'])
    .config(require('./routes').layoutRoutes)
    .run(require('./services').RunApp);
},{"./routes":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/routes.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/routes.js":[function(require,module,exports){
'use strict';

var controller = require('./controllers');

function layoutRoutes($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('layout', {
            abstract: true,
            template: require('./templates/layout.html'),
            controller: controller.LayoutController,
            resolve: {
                treks : function(treksService) {
                    return treksService.getTreks();
                }
            }
        })
        .state('root', {
            parent: 'layout',
            url: '/',
            views: {
                'header' : {
                    template: require('./templates/header.html'),
                    controller: controller.HeaderController
                },
                'sidebar' : {
                    template: require('./templates/sidebar.html'),
                    controller: controller.SidebarController
                },
                'content' : {
                    template: require('./templates/content-home.html'),
                },
                'footer' : {
                    template: require('./templates/footer.html'),
                    controller: controller.FooterController
                },
            }

        });
}

module.exports = {
    layoutRoutes: layoutRoutes
};
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/controllers.js","./templates/content-home.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/content-home.html","./templates/footer.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/footer.html","./templates/header.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/header.html","./templates/layout.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/layout.html","./templates/sidebar.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/sidebar.html"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/services.js":[function(require,module,exports){
'use strict';


function RunApp() {
    console.log('app started');
}

module.exports = {
    RunApp: RunApp
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/content-home.html":[function(require,module,exports){
module.exports = '<div class="results-drawer">\n    <treks-liste></treks-liste>    \n</div>\n<geotrek-map></geotrek-map>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/footer.html":[function(require,module,exports){
module.exports = '<div class="container">\n\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/header.html":[function(require,module,exports){
module.exports = '<div class="container" role="navigation">\n    <div id="logo">Logo</div>\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/layout.html":[function(require,module,exports){
module.exports = '<div id="header" ui-view="header"></div>\n<div id="main-content" class="fluid-cotainer">\n    <div class="row">\n        <div id="sidebar" ui-view="sidebar" class="col-sm-1"></div>\n        <div ui-view="content" class="col-sm-11 content"></div>\n    </div>\n</div>\n<div id="footer" ui-view="footer"></div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/templates/sidebar.html":[function(require,module,exports){
module.exports = '<div>\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/controllers.js":[function(require,module,exports){
'use strict';

function MapController(settingsFactory) {
    var map = L.map('map').setView([settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE], settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM);

    L.tileLayer(settingsFactory.LEAFLET_BACKGROUND_URL, {
        attribution: settingsFactory.LEAFLET_CONF.ATTRIBUTION,
        minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
        maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM
    }).addTo(map);
}

module.exports = {
    MapController : MapController
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/directives.js":[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function mapDirective() {
    console.log('map loading');
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/map.html'),
        controller: controllers.MapController
    };
}

module.exports = {
    mapDirective: mapDirective
};

},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/controllers.js","./templates/map.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/templates/map.html"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.map', [])
    .service('mapService', require('./services').mapService)
    .controller('MapController', require('./controllers').MapController)
    .directive('geotrekMap', require('./directives').mapDirective);
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/controllers.js","./directives":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/directives.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/services.js":[function(require,module,exports){
'use strict';

function mapService() {

}

module.exports = {
    mapService : mapService
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/templates/map.html":[function(require,module,exports){
module.exports = '<div id="map">\n\n</div>';
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js":[function(require,module,exports){
'use strict';

function TreksListeController($scope) {
    
}


module.exports = {
    TreksListeController: TreksListeController
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/directives.js":[function(require,module,exports){
'use strict';

var controllers = require('./controllers');

function treksListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/treks-liste.html'),
        controller: controllers.TreksListeController
    };
}

module.exports = {
    treksListeDirective: treksListeDirective
};

},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js","./templates/treks-liste.html":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/templates/treks-liste.html"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.treks', [])
    .service('treksService', require('./services').treksService)
    .controller('TreksListeController', require('./controllers').TreksListeController)
    .directive('treksListe', require('./directives').treksListeDirective);
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/controllers.js","./directives":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/directives.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/services.js":[function(require,module,exports){
'use strict';

function treksService(settingsFactory, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (treksData) {        

        // Parse trek pictures, and change their URL
        angular.forEach(treksData.features, function(trek) {
            angular.forEach(trek.properties.pictures, function(picture) {
                picture.url = settingsFactory.DOMAIN + picture.url;
            });
            angular.forEach(trek.properties.usages, function(usage) {
                usage.pictogram = settingsFactory.DOMAIN + usage.pictogram;
            });
            angular.forEach(trek.properties.themes, function(theme) {
                theme.pictogram = settingsFactory.DOMAIN + theme.pictogram;
            });
            angular.forEach(trek.properties.networks, function(network) {
                network.pictogram = settingsFactory.DOMAIN + network.pictogram;
            });
            angular.forEach(trek.properties.information_desks, function(information_desk) {
                information_desk.photo_url = settingsFactory.DOMAIN + information_desk.photo_url;
            });
            trek.properties.thumbnail = settingsFactory.DOMAIN + trek.properties.thumbnail;
            trek.properties.difficulty.pictogram = settingsFactory.DOMAIN + trek.properties.difficulty.pictogram;
            trek.properties.altimetric_profile = settingsFactory.DOMAIN + trek.properties.altimetric_profile.replace(".json", ".svg");
        });
        return treksData;
    };

    this.getTreks = function () {

        var deferred = $q.defer();

        if (self._trekList) {

            deferred.resolve(self._trekList);

        } else {
            var url = settingsFactory.treksUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            });

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var convertedImgs = self.replaceImgURLs(data);
                    self._trekList = convertedImgs;
                    deferred.resolve(convertedImgs);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    treksService: treksService
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/templates/treks-liste.html":[function(require,module,exports){
module.exports = '<section class="treks-liste">\n    <article ng-repeat="trek in treks.features" ng-id="trek-{{trek.id}}" class="trek col-sm-12 col-md-6">\n        <div class="visual">\n            <div class="fav-or-not">\n                <i class="glyphicon glyphicon-heart"></i>\n            </div>\n            <img ng-src="{{trek.properties.pictures[0].url}}" ng-alt="{{trek.properties.pictures[0].title}}">    \n        </div>\n        <h1 class="title">{{trek.properties.name}}</h1>\n        <div class="infos">\n            <span>{{trek.properties.districts[0].name}} - </span>\n            <span>{{trek.properties.duration_pretty}} - </span>\n            <span>Dénivelé {{trek.properties.ascent}} - </span>\n            <span>{{trek.properties.difficulty.label}} - </span>\n            <span>{{trek.properties.usages[0].label}}</span>\n        </div>\n        <ul class="themes">\n            <li ng-repeat="theme in trek.properties.themes">\n                <img ng-src="{{theme.pictogram}}" ng-alt="{{theme.label}}">\n            </li>\n        </ul>\n        <div class="know-more">\n            <span>+</span>\n        </div>\n\n    </article>\n</section>';
},{}]},{},["./src/app/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2FwcC5qcyIsInNyYy9hcHAvY29uZmlnL2ZhY3Rvcmllcy5qcyIsInNyYy9hcHAvY29uZmlnL2luZGV4LmpzIiwic3JjL2FwcC9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL2xheW91dC9pbmRleC5qcyIsInNyYy9hcHAvbGF5b3V0L3JvdXRlcy5qcyIsInNyYy9hcHAvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2Zvb3Rlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2xheW91dC5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL3NpZGViYXIuaHRtbCIsInNyYy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInNyYy9hcHAvbWFwL2luZGV4LmpzIiwic3JjL2FwcC9tYXAvc2VydmljZXMuanMiLCJzcmMvYXBwL21hcC90ZW1wbGF0ZXMvbWFwLmh0bWwiLCJzcmMvYXBwL3RyZWtzL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC90cmVrcy9kaXJlY3RpdmVzLmpzIiwic3JjL2FwcC90cmVrcy9pbmRleC5qcyIsInNyYy9hcHAvdHJla3Mvc2VydmljZXMuanMiLCJzcmMvYXBwL3RyZWtzL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlcGVuZGVuY2llcyA9IFtcbiAgICAvLyBPdXIgc3VibW9kdWxlc1xuICAgICdyYW5kby5jb25maWcnLCAncmFuZG8udHJla3MnLCAncmFuZG8ubGF5b3V0JywgJ3JhbmRvLm1hcCcsXG5cbiAgICAvLyBFeHRlcm5hbCBzdHVmZlxuICAgICd1aS5yb3V0ZXInLCAnbmdSZXNvdXJjZSdcbl07XG5cbmFuZ3VsYXIubW9kdWxlKCdnZW90cmVrUmFuZG8nLCBkZXBlbmRlbmNpZXMpO1xuXG4vLyBSZXF1aXJlIEdlb3RyZWsgY29tcG9uZW50c1xucmVxdWlyZSgnLi9jb25maWcnKTtcbi8vcmVxdWlyZSgnLi9jb21tb25zJyk7XG5yZXF1aXJlKCcuL2xheW91dCcpO1xucmVxdWlyZSgnLi90cmVrcycpO1xucmVxdWlyZSgnLi9tYXAnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gc2V0dGluZ3NGYWN0b3J5KGdsb2JhbFNldHRpbmdzKSB7XG5cbiAgICAvLyBDT05TVEFOVFMgVkFSIHRoYXQgdXNlciBjYW4gY2hhbmdlXG4gICAgLy9cbiAgICB2YXIgRE9NQUlOID0gJ2h0dHA6Ly8xOTIuMTY4LjEwMC40Nzo4ODg4JyxcblxuICAgICAgICAvL1BBVEhTIEFORCBESVJFQ1RPUllcbiAgICAgICAgRklMRVNfRElSID0gJ2ZpbGVzL2FwaScsXG4gICAgICAgIFRSRUtfRElSID0gJ3RyZWsnLFxuICAgICAgICBUSUxFU19ESVIgPSAndGlsZXMnLFxuXG4gICAgICAgIFRSRUtTX0ZJTEUgPSAndHJlay5nZW9qc29uJyxcbiAgICAgICAgLy9QT0lfRklMRSA9ICdwb2lzLmdlb2pzb24nLFxuXG4gICAgICAgIExFQUZMRVRfQkFDS0dST1VORF9VUkwgPSAnaHR0cDovL3tzfS50aWxlLm9wZW5zdHJlZXRtYXAub3JnL3t6fS97eH0ve3l9LnBuZycsXG5cbiAgICAgICAgTEVBRkxFVF9DT05GID0ge1xuICAgICAgICAgICAgQ0VOVEVSX0xBVElUVURFOiA0NC44MyxcbiAgICAgICAgICAgIENFTlRFUl9MT05HSVRVREU6IDYuMzQsXG4gICAgICAgICAgICBERUZBVUxUX1pPT006IDEyLFxuICAgICAgICAgICAgREVGQVVMVF9NSU5fWk9PTTogOCxcbiAgICAgICAgICAgIERFRkFVTFRfTUFYX1pPT006IDE2LFxuICAgICAgICAgICAgQVRUUklCVVRJT046ICcoYykgSUdOIEdlb3BvcnRhaWwnLFxuICAgICAgICAgICAgVFJFS19DT0xPUjogJyNGODk0MDYnXG4gICAgICAgIH07XG5cbiAgICAvLyBQUklWQVRFIFZBUlxuICAgIC8vXG4gICAgdmFyIF9hY3RpdmVMYW5nID0gZ2xvYmFsU2V0dGluZ3MuREVGQVVMVF9MQU5HVUFHRTtcblxuXG4gICAgLy8gUFVCTElDIFZBUlxuICAgIC8vXG4gICAgdmFyIHRyZWtzVXJsID0gIERPTUFJTiArICcvJyArIEZJTEVTX0RJUiArICcvJyArIFRSRUtfRElSICsgJy8nICsgVFJFS1NfRklMRTtcblxuICAgIC8vUFVCTElDIE1FVEhPRFNcbiAgICAvL1xuICAgIHZhciBzZXRMYW5nID0gZnVuY3Rpb24gKG5ld0xhbmcpIHtcbiAgICAgICAgX2FjdGl2ZUxhbmcgPSBuZXdMYW5nO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdmFyIGdldExhbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfYWN0aXZlTGFuZztcbiAgICB9O1xuXG5cblxuICAgIHJldHVybiB7XG4gICAgICAgIC8vQ09OU1RBTlRTXG4gICAgICAgIERPTUFJTjogRE9NQUlOLFxuICAgICAgICBMRUFGTEVUX0JBQ0tHUk9VTkRfVVJMOiBMRUFGTEVUX0JBQ0tHUk9VTkRfVVJMLFxuICAgICAgICBMRUFGTEVUX0NPTkY6IExFQUZMRVRfQ09ORixcblxuICAgICAgICAvL1BVQkxJQyBWQVJcbiAgICAgICAgdHJla3NVcmw6IHRyZWtzVXJsLFxuXG4gICAgICAgIC8vTUVUSE9EU1xuICAgICAgICBzZXRMYW5nOiBzZXRMYW5nLFxuICAgICAgICBnZXRMYW5nOiBnZXRMYW5nXG5cbiAgICB9O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldHRpbmdzRmFjdG9yeTogc2V0dGluZ3NGYWN0b3J5XG59OyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLmNvbmZpZycsIFtdKVxuICAgIC5jb25zdGFudCgnZ2xvYmFsU2V0dGluZ3MnLCB7XG4gICAgICAgIERFRkFVTFRfTEFOR1VBR0U6ICdmcidcbiAgICB9KVxuICAgIC5mYWN0b3J5KCdzZXR0aW5nc0ZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3RvcmllcycpLnNldHRpbmdzRmFjdG9yeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCRzY29wZSwgdHJla3MpIHtcbiAgICAkc2NvcGUudHJla3MgPSB0cmVrcztcbiAgICBjb25zb2xlLmxvZyh0cmVrcyk7XG59XG5cbmZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIFNpZGViYXJDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBGb290ZXJDb250cm9sbGVyKCkge1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIExheW91dENvbnRyb2xsZXI6IExheW91dENvbnRyb2xsZXIsXG4gICAgSGVhZGVyQ29udHJvbGxlcjogSGVhZGVyQ29udHJvbGxlcixcbiAgICBTaWRlYmFyQ29udHJvbGxlcjogU2lkZWJhckNvbnRyb2xsZXIsXG4gICAgRm9vdGVyQ29udHJvbGxlcjogRm9vdGVyQ29udHJvbGxlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby5sYXlvdXQnLCBbJ3VpLnJvdXRlcicsICdyYW5kby50cmVrcyddKVxuICAgIC5jb25maWcocmVxdWlyZSgnLi9yb3V0ZXMnKS5sYXlvdXRSb3V0ZXMpXG4gICAgLnJ1bihyZXF1aXJlKCcuL3NlcnZpY2VzJykuUnVuQXBwKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250cm9sbGVyID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBsYXlvdXRSb3V0ZXMoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdsYXlvdXQnLCB7XG4gICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9sYXlvdXQuaHRtbCcpLFxuICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlci5MYXlvdXRDb250cm9sbGVyLFxuICAgICAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgICAgIHRyZWtzIDogZnVuY3Rpb24odHJla3NTZXJ2aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmVrc1NlcnZpY2UuZ2V0VHJla3MoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncm9vdCcsIHtcbiAgICAgICAgICAgIHBhcmVudDogJ2xheW91dCcsXG4gICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgJ2hlYWRlcicgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9oZWFkZXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkhlYWRlckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzaWRlYmFyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL3NpZGViYXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLlNpZGViYXJDb250cm9sbGVyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnY29udGVudCcgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9jb250ZW50LWhvbWUuaHRtbCcpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2Zvb3RlcicgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9mb290ZXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkZvb3RlckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsYXlvdXRSb3V0ZXM6IGxheW91dFJvdXRlc1xufTsiLCIndXNlIHN0cmljdCc7XG5cblxuZnVuY3Rpb24gUnVuQXBwKCkge1xuICAgIGNvbnNvbGUubG9nKCdhcHAgc3RhcnRlZCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBSdW5BcHA6IFJ1bkFwcFxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicmVzdWx0cy1kcmF3ZXJcIj5cXG4gICAgPHRyZWtzLWxpc3RlPjwvdHJla3MtbGlzdGU+ICAgIFxcbjwvZGl2PlxcbjxnZW90cmVrLW1hcD48L2dlb3RyZWstbWFwPic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxcblxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiIHJvbGU9XCJuYXZpZ2F0aW9uXCI+XFxuICAgIDxkaXYgaWQ9XCJsb2dvXCI+TG9nbzwvZGl2PlxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBpZD1cImhlYWRlclwiIHVpLXZpZXc9XCJoZWFkZXJcIj48L2Rpdj5cXG48ZGl2IGlkPVwibWFpbi1jb250ZW50XCIgY2xhc3M9XCJmbHVpZC1jb3RhaW5lclwiPlxcbiAgICA8ZGl2IGNsYXNzPVwicm93XCI+XFxuICAgICAgICA8ZGl2IGlkPVwic2lkZWJhclwiIHVpLXZpZXc9XCJzaWRlYmFyXCIgY2xhc3M9XCJjb2wtc20tMVwiPjwvZGl2PlxcbiAgICAgICAgPGRpdiB1aS12aWV3PVwiY29udGVudFwiIGNsYXNzPVwiY29sLXNtLTExIGNvbnRlbnRcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBpZD1cImZvb3RlclwiIHVpLXZpZXc9XCJmb290ZXJcIj48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuPC9kaXY+JzsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE1hcENvbnRyb2xsZXIoc2V0dGluZ3NGYWN0b3J5KSB7XG4gICAgdmFyIG1hcCA9IEwubWFwKCdtYXAnKS5zZXRWaWV3KFtzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkNFTlRFUl9MQVRJVFVERSwgc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5DRU5URVJfTE9OR0lUVURFXSwgc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5ERUZBVUxUX1pPT00pO1xuXG4gICAgTC50aWxlTGF5ZXIoc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQkFDS0dST1VORF9VUkwsIHtcbiAgICAgICAgYXR0cmlidXRpb246IHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuQVRUUklCVVRJT04sXG4gICAgICAgIG1pblpvb206IHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuREVGQVVMVF9NSU5fWk9PTSxcbiAgICAgICAgbWF4Wm9vbTogc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5ERUZBVUxUX01BWF9aT09NXG4gICAgfSkuYWRkVG8obWFwKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTWFwQ29udHJvbGxlciA6IE1hcENvbnRyb2xsZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29udHJvbGxlcnMgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIG1hcERpcmVjdGl2ZSgpIHtcbiAgICBjb25zb2xlLmxvZygnbWFwIGxvYWRpbmcnKTtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvbWFwLmh0bWwnKSxcbiAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlcnMuTWFwQ29udHJvbGxlclxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1hcERpcmVjdGl2ZTogbWFwRGlyZWN0aXZlXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgncmFuZG8ubWFwJywgW10pXG4gICAgLnNlcnZpY2UoJ21hcFNlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykubWFwU2VydmljZSlcbiAgICAuY29udHJvbGxlcignTWFwQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5NYXBDb250cm9sbGVyKVxuICAgIC5kaXJlY3RpdmUoJ2dlb3RyZWtNYXAnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKS5tYXBEaXJlY3RpdmUpOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbWFwU2VydmljZSgpIHtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYXBTZXJ2aWNlIDogbWFwU2VydmljZVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGlkPVwibWFwXCI+XFxuXFxuPC9kaXY+JzsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFRyZWtzTGlzdGVDb250cm9sbGVyKCRzY29wZSkge1xuICAgIFxufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFRyZWtzTGlzdGVDb250cm9sbGVyOiBUcmVrc0xpc3RlQ29udHJvbGxlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250cm9sbGVycyA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gdHJla3NMaXN0ZURpcmVjdGl2ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvdHJla3MtbGlzdGUuaHRtbCcpLFxuICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5UcmVrc0xpc3RlQ29udHJvbGxlclxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHRyZWtzTGlzdGVEaXJlY3RpdmU6IHRyZWtzTGlzdGVEaXJlY3RpdmVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby50cmVrcycsIFtdKVxuICAgIC5zZXJ2aWNlKCd0cmVrc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykudHJla3NTZXJ2aWNlKVxuICAgIC5jb250cm9sbGVyKCdUcmVrc0xpc3RlQ29udHJvbGxlcicsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKS5UcmVrc0xpc3RlQ29udHJvbGxlcilcbiAgICAuZGlyZWN0aXZlKCd0cmVrc0xpc3RlJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzJykudHJla3NMaXN0ZURpcmVjdGl2ZSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiB0cmVrc1NlcnZpY2Uoc2V0dGluZ3NGYWN0b3J5LCAkcmVzb3VyY2UsICRxKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLnJlcGxhY2VJbWdVUkxzID0gZnVuY3Rpb24gKHRyZWtzRGF0YSkgeyAgICAgICAgXG5cbiAgICAgICAgLy8gUGFyc2UgdHJlayBwaWN0dXJlcywgYW5kIGNoYW5nZSB0aGVpciBVUkxcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzRGF0YS5mZWF0dXJlcywgZnVuY3Rpb24odHJlaykge1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5waWN0dXJlcywgZnVuY3Rpb24ocGljdHVyZSnCoHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlLnVybCA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyBwaWN0dXJlLnVybDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy51c2FnZXMsIGZ1bmN0aW9uKHVzYWdlKcKge1xuICAgICAgICAgICAgICAgIHVzYWdlLnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB1c2FnZS5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMudGhlbWVzLCBmdW5jdGlvbih0aGVtZSnCoHtcbiAgICAgICAgICAgICAgICB0aGVtZS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdGhlbWUucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLm5ldHdvcmtzLCBmdW5jdGlvbihuZXR3b3JrKcKge1xuICAgICAgICAgICAgICAgIG5ldHdvcmsucGljdG9ncmFtID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIG5ldHdvcmsucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmluZm9ybWF0aW9uX2Rlc2tzLCBmdW5jdGlvbihpbmZvcm1hdGlvbl9kZXNrKcKge1xuICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMudGh1bWJuYWlsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHRyZWsucHJvcGVydGllcy50aHVtYm5haWw7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkucGljdG9ncmFtO1xuICAgICAgICAgICAgdHJlay5wcm9wZXJ0aWVzLmFsdGltZXRyaWNfcHJvZmlsZSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0cmVrLnByb3BlcnRpZXMuYWx0aW1ldHJpY19wcm9maWxlLnJlcGxhY2UoXCIuanNvblwiLCBcIi5zdmdcIik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJla3NEYXRhO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3RyZWtMaXN0KSB7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2VsZi5fdHJla0xpc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gc2V0dGluZ3NGYWN0b3J5LnRyZWtzVXJsO1xuXG4gICAgICAgICAgICB2YXIgcmVxdWVzdHMgPSAkcmVzb3VyY2UodXJsLCB7fSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RzLnF1ZXJ5KCkuJHByb21pc2VcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGFuZ3VsYXIuZnJvbUpzb24oZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0ZWRJbWdzID0gc2VsZi5yZXBsYWNlSW1nVVJMcyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fdHJla0xpc3QgPSBjb252ZXJ0ZWRJbWdzO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbnZlcnRlZEltZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgIH07XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NTZXJ2aWNlOiB0cmVrc1NlcnZpY2Vcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAnPHNlY3Rpb24gY2xhc3M9XCJ0cmVrcy1saXN0ZVwiPlxcbiAgICA8YXJ0aWNsZSBuZy1yZXBlYXQ9XCJ0cmVrIGluIHRyZWtzLmZlYXR1cmVzXCIgbmctaWQ9XCJ0cmVrLXt7dHJlay5pZH19XCIgY2xhc3M9XCJ0cmVrIGNvbC1zbS0xMiBjb2wtbWQtNlwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cInZpc3VhbFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYXYtb3Itbm90XCI+XFxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1oZWFydFwiPjwvaT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7dHJlay5wcm9wZXJ0aWVzLnBpY3R1cmVzWzBdLnVybH19XCIgbmctYWx0PVwie3t0cmVrLnByb3BlcnRpZXMucGljdHVyZXNbMF0udGl0bGV9fVwiPiAgICBcXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGgxIGNsYXNzPVwidGl0bGVcIj57e3RyZWsucHJvcGVydGllcy5uYW1lfX08L2gxPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cImluZm9zXCI+XFxuICAgICAgICAgICAgPHNwYW4+e3t0cmVrLnByb3BlcnRpZXMuZGlzdHJpY3RzWzBdLm5hbWV9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy5kdXJhdGlvbl9wcmV0dHl9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj5Ew6luaXZlbMOpIHt7dHJlay5wcm9wZXJ0aWVzLmFzY2VudH19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkubGFiZWx9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy51c2FnZXNbMF0ubGFiZWx9fTwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPHVsIGNsYXNzPVwidGhlbWVzXCI+XFxuICAgICAgICAgICAgPGxpIG5nLXJlcGVhdD1cInRoZW1lIGluIHRyZWsucHJvcGVydGllcy50aGVtZXNcIj5cXG4gICAgICAgICAgICAgICAgPGltZyBuZy1zcmM9XCJ7e3RoZW1lLnBpY3RvZ3JhbX19XCIgbmctYWx0PVwie3t0aGVtZS5sYWJlbH19XCI+XFxuICAgICAgICAgICAgPC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwia25vdy1tb3JlXCI+XFxuICAgICAgICAgICAgPHNwYW4+Kzwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICA8L2FydGljbGU+XFxuPC9zZWN0aW9uPic7Il19
