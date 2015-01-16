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
    var DOMAIN = 'http://192.168.100.44:8888',

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

function MapController($scope, settingsFactory, mapService, iconsService) {
    
    var map, treksLayer;

    var treks = $scope.treks;

    function mapInit(mapId) {

        var mapParameters = mapService.getMapInitParameters();

        map = L.map(mapId, mapParameters);

        treksLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function(cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });
        $scope.treksLayer = treksLayer;

        // Show the scale and attribution controls
        mapService.setScale(map);
        mapService.setAttribution(map);
        showTreks();

    }

     // Add treks geojson to the map
    function showTreks() {
        // Remove all markers so the displayed markers can fit the search results
        treksLayer.clearLayers();

        //$scope.mapService = mapService;
        angular.forEach(treks.features/*filterFilter($rootScope.filteredTreks, $scope.activeFilters.search)*/, function(trek) {
            var trekDeparture = mapService.createClusterMarkerFromTrek(trek);
            trekDeparture.on({
                click: function(e) {
                    console.log('marker Clicked');
                    //$state.go("home.map.detail", { trekId: trek.id });
                }
            });
            treksLayer.addLayer(trekDeparture);
        });
        map.addLayer(treksLayer);

        /*if ((updateBounds == undefined) || (updateBounds == true)) {    
            map.fitBounds(treksLayer.getBounds());
        }*/
    };

    mapInit('map');
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
        transclude: true,
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
    .service('iconsService', require('./services').iconsService)
    .controller('MapController', require('./controllers').MapController)
    .directive('geotrekMap', require('./directives').mapDirective);
},{"./controllers":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/controllers.js","./directives":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/directives.js","./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/services.js":[function(require,module,exports){
'use strict';

function mapService($q, settingsFactory, treksService, iconsService) {

    var _markers = [];

    this.getMarkers = function() {
        return _markers;
    };

    this.setMarkers = function(markers) {
        _markers = markers;
    };

    this.getMapInitParameters = function() {
        // Set default Leaflet map params

        var map_parameters = {
            center: [settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            zoomControl: false,
            layers: L.tileLayer(settingsFactory.LEAFLET_BACKGROUND_URL)
        };

        return map_parameters;
    };

    this.createMarkersFromTrek = function(trek, pois) {
        var markers = [];

        var startPoint = treksService.getStartPoint(trek);
        var endPoint = treksService.getEndPoint(trek);
        var parkingPoint = treksService.getParkingPoint(trek);

        markers.push(L.marker([endPoint.lat, endPoint.lng], {
            icon: iconsService.getArrivalIcon(),
            name: trek.properties.arrival,
        }));

        markers.push(L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getDepartureIcon(),
            name: trek.properties.departure,
        }));

        if(parkingPoint) {
            markers.push(L.marker([parkingPoint.lat, parkingPoint.lng], {
            icon: iconsService.getParkingIcon(),
            name: "Parking",
            description: trek.properties.advised_parking,
            }));
        };

        var informationCount = 0;
        angular.forEach(trek.properties.information_desks, function(information) {
            var informationDescription = "<p>" + information.description + "</p>"
                + "<p>" + information.street + "</p>"
                + "<p>" + information.postal_code + " " + information.municipality + "</p>"
                + "<p><a href='" + information.website + "'>Web</a> - <a href='tel:" + information.phone + "'>" + information.phone + "</a></p>";

            markers.push(L.marker([information.latitude, information.longitude], {
                icon: iconsService.getInformationIcon(),
                name: information.name,
                thumbnail: information.photo_url,
                description: informationDescription,
            }));
            informationCount += 1;
        });

        angular.forEach(pois, function(poi) {
            var poiCoords = {
                'lat': poi.geometry.coordinates[1],
                'lng': poi.geometry.coordinates[0]
            };
            var poiIcon = iconsService.getPOIIcon(poi);
            markers.push(L.marker([poiCoords.lat, poiCoords.lng], {
                icon: poiIcon,
                name: poi.properties.name,
                description: poi.properties.description,
                thumbnail: poi.properties.thumbnail,
                img: poi.properties.pictures[0],
                pictogram: poi.properties.type.pictogram
            }));
        });

        return markers;
    };

    this.createClusterMarkerFromTrek = function(trek) {
        var startPoint = treksService.getStartPoint(trek);

        var marker = L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getTrekIcon()
        });

        return marker;
    };

    this.setScale = function(map) {
        L.control.scale({imperial: false}).addTo(map);
    };

    this.setAttribution = function(map) {
        map.attributionControl.setPrefix(settingsFactory.LEAFLET_CONF.ATTRIBUTION);
    };

    this.setPositionMarker = function() {

        // Pulsing marker inspired by
        // http://blog.thematicmapping.org/2014/06/real-time-tracking-with-spot-and-leafet.html
        return {
            radius: 7,
            color: 'black',
            fillColor: '#981d97',
            fillOpacity: 1,
            type: 'circleMarker',
            className: 'leaflet-live-user',
            weight: 2
        };
    }

}

function iconsService($window) {

    var trek_icons = {
        default_icon: {},
        departure_icon: L.icon({
            iconUrl: 'images/marker-source.png',
            iconSize: [64, 64],
            iconAnchor: [32, 64],
            labelAnchor: [20, -50]
        }),
        arrival_icon: L.icon({
            iconUrl: 'images/marker-target.png',
            iconSize: [64, 64],
            iconAnchor: [32, 64],
            labelAnchor: [20, -50]
        }),
        parking_icon: L.icon({
            iconUrl: 'images/parking.png',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        information_icon: L.icon({
            iconUrl: 'images/information.svg',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        }),
        poi_icon: L.icon({
            iconSize: [40, 40],
            labelAnchor: [20, -50]
        }),
        trek_icon: L.divIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-icon',
            labelAnchor: [20, 0]
        })
    };

    this.getPOIIcon = function(poi) {
        var pictogramUrl = poi.properties.type.pictogram;

        return L.icon({
            iconUrl: pictogramUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
    };

    this.getClusterIcon = function(cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-cluster',
            html: '<span class="count">' + cluster.getChildCount() + '</span>'
        });
    };

    this.getDepartureIcon = function() {
        return trek_icons.departure_icon;
    };

    this.getArrivalIcon = function() {
        return trek_icons.arrival_icon;
    };

    this.getParkingIcon = function() {
        return trek_icons.parking_icon;
    };

    this.getInformationIcon = function() {
        return trek_icons.information_icon;
    };

    this.getTrekIcon = function() {
        return trek_icons.trek_icon;
    };

}

module.exports = {
    mapService: mapService,
    iconsService: iconsService
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

    this.getStartPoint = function(trek) {
        console.log(trek);
        var firstPointCoordinates = trek.geometry.coordinates[0];

        return {'lat': firstPointCoordinates[1],
                'lng': firstPointCoordinates[0]}
    };

    this.getEndPoint = function(trek) {
        var nbPts = trek.geometry.coordinates.length;
        var lastPointCoordinates = trek.geometry.coordinates[nbPts-1];

        return {'lat': lastPointCoordinates[1],
                'lng': lastPointCoordinates[0]}
    };

    this.getParkingPoint = function(trek) {
        var parkingCoordinates = trek.properties.parking_location;

        return parkingCoordinates ? {'lat': parkingCoordinates[1],
                'lng': parkingCoordinates[0]} : null
    };

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2FwcC5qcyIsInNyYy9hcHAvY29uZmlnL2ZhY3Rvcmllcy5qcyIsInNyYy9hcHAvY29uZmlnL2luZGV4LmpzIiwic3JjL2FwcC9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL2xheW91dC9pbmRleC5qcyIsInNyYy9hcHAvbGF5b3V0L3JvdXRlcy5qcyIsInNyYy9hcHAvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2Zvb3Rlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2xheW91dC5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL3NpZGViYXIuaHRtbCIsInNyYy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInNyYy9hcHAvbWFwL2luZGV4LmpzIiwic3JjL2FwcC9tYXAvc2VydmljZXMuanMiLCJzcmMvYXBwL21hcC90ZW1wbGF0ZXMvbWFwLmh0bWwiLCJzcmMvYXBwL3RyZWtzL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC90cmVrcy9kaXJlY3RpdmVzLmpzIiwic3JjL2FwcC90cmVrcy9pbmRleC5qcyIsInNyYy9hcHAvdHJla3Mvc2VydmljZXMuanMiLCJzcmMvYXBwL3RyZWtzL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9NQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZGVwZW5kZW5jaWVzID0gW1xuICAgIC8vIE91ciBzdWJtb2R1bGVzXG4gICAgJ3JhbmRvLmNvbmZpZycsICdyYW5kby50cmVrcycsICdyYW5kby5sYXlvdXQnLCAncmFuZG8ubWFwJyxcblxuICAgIC8vIEV4dGVybmFsIHN0dWZmXG4gICAgJ3VpLnJvdXRlcicsICduZ1Jlc291cmNlJ1xuXTtcblxuYW5ndWxhci5tb2R1bGUoJ2dlb3RyZWtSYW5kbycsIGRlcGVuZGVuY2llcyk7XG5cbi8vIFJlcXVpcmUgR2VvdHJlayBjb21wb25lbnRzXG5yZXF1aXJlKCcuL2NvbmZpZycpO1xuLy9yZXF1aXJlKCcuL2NvbW1vbnMnKTtcbnJlcXVpcmUoJy4vbGF5b3V0Jyk7XG5yZXF1aXJlKCcuL3RyZWtzJyk7XG5yZXF1aXJlKCcuL21hcCcpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzZXR0aW5nc0ZhY3RvcnkoZ2xvYmFsU2V0dGluZ3MpIHtcblxuICAgIC8vIENPTlNUQU5UUyBWQVIgdGhhdCB1c2VyIGNhbiBjaGFuZ2VcbiAgICAvL1xuICAgIHZhciBET01BSU4gPSAnaHR0cDovLzE5Mi4xNjguMTAwLjQ0Ojg4ODgnLFxuXG4gICAgICAgIC8vUEFUSFMgQU5EIERJUkVDVE9SWVxuICAgICAgICBGSUxFU19ESVIgPSAnZmlsZXMvYXBpJyxcbiAgICAgICAgVFJFS19ESVIgPSAndHJlaycsXG4gICAgICAgIFRJTEVTX0RJUiA9ICd0aWxlcycsXG5cbiAgICAgICAgVFJFS1NfRklMRSA9ICd0cmVrLmdlb2pzb24nLFxuICAgICAgICAvL1BPSV9GSUxFID0gJ3BvaXMuZ2VvanNvbicsXG5cbiAgICAgICAgTEVBRkxFVF9CQUNLR1JPVU5EX1VSTCA9ICdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyxcblxuICAgICAgICBMRUFGTEVUX0NPTkYgPSB7XG4gICAgICAgICAgICBDRU5URVJfTEFUSVRVREU6IDQ0LjgzLFxuICAgICAgICAgICAgQ0VOVEVSX0xPTkdJVFVERTogNi4zNCxcbiAgICAgICAgICAgIERFRkFVTFRfWk9PTTogMTIsXG4gICAgICAgICAgICBERUZBVUxUX01JTl9aT09NOiA4LFxuICAgICAgICAgICAgREVGQVVMVF9NQVhfWk9PTTogMTYsXG4gICAgICAgICAgICBBVFRSSUJVVElPTjogJyhjKSBJR04gR2VvcG9ydGFpbCcsXG4gICAgICAgICAgICBUUkVLX0NPTE9SOiAnI0Y4OTQwNidcbiAgICAgICAgfTtcblxuICAgIC8vIFBSSVZBVEUgVkFSXG4gICAgLy9cbiAgICB2YXIgX2FjdGl2ZUxhbmcgPSBnbG9iYWxTZXR0aW5ncy5ERUZBVUxUX0xBTkdVQUdFO1xuXG5cbiAgICAvLyBQVUJMSUMgVkFSXG4gICAgLy9cbiAgICB2YXIgdHJla3NVcmwgPSAgRE9NQUlOICsgJy8nICsgRklMRVNfRElSICsgJy8nICsgVFJFS19ESVIgKyAnLycgKyBUUkVLU19GSUxFO1xuXG4gICAgLy9QVUJMSUMgTUVUSE9EU1xuICAgIC8vXG4gICAgdmFyIHNldExhbmcgPSBmdW5jdGlvbiAobmV3TGFuZykge1xuICAgICAgICBfYWN0aXZlTGFuZyA9IG5ld0xhbmc7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICB2YXIgZ2V0TGFuZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9hY3RpdmVMYW5nO1xuICAgIH07XG5cblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgLy9DT05TVEFOVFNcbiAgICAgICAgRE9NQUlOOiBET01BSU4sXG4gICAgICAgIExFQUZMRVRfQkFDS0dST1VORF9VUkw6IExFQUZMRVRfQkFDS0dST1VORF9VUkwsXG4gICAgICAgIExFQUZMRVRfQ09ORjogTEVBRkxFVF9DT05GLFxuXG4gICAgICAgIC8vUFVCTElDIFZBUlxuICAgICAgICB0cmVrc1VybDogdHJla3NVcmwsXG5cbiAgICAgICAgLy9NRVRIT0RTXG4gICAgICAgIHNldExhbmc6IHNldExhbmcsXG4gICAgICAgIGdldExhbmc6IGdldExhbmdcblxuICAgIH07XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgc2V0dGluZ3NGYWN0b3J5OiBzZXR0aW5nc0ZhY3Rvcnlcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgncmFuZG8uY29uZmlnJywgW10pXG4gICAgLmNvbnN0YW50KCdnbG9iYWxTZXR0aW5ncycsIHtcbiAgICAgICAgREVGQVVMVF9MQU5HVUFHRTogJ2ZyJ1xuICAgIH0pXG4gICAgLmZhY3RvcnkoJ3NldHRpbmdzRmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzJykuc2V0dGluZ3NGYWN0b3J5KTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoJHNjb3BlLCB0cmVrcykge1xuICAgICRzY29wZS50cmVrcyA9IHRyZWtzO1xuICAgIGNvbnNvbGUubG9nKHRyZWtzKTtcbn1cblxuZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigpIHtcbn1cblxuZnVuY3Rpb24gU2lkZWJhckNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIEZvb3RlckNvbnRyb2xsZXIoKSB7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTGF5b3V0Q29udHJvbGxlcjogTGF5b3V0Q29udHJvbGxlcixcbiAgICBIZWFkZXJDb250cm9sbGVyOiBIZWFkZXJDb250cm9sbGVyLFxuICAgIFNpZGViYXJDb250cm9sbGVyOiBTaWRlYmFyQ29udHJvbGxlcixcbiAgICBGb290ZXJDb250cm9sbGVyOiBGb290ZXJDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLmxheW91dCcsIFsndWkucm91dGVyJywgJ3JhbmRvLnRyZWtzJ10pXG4gICAgLmNvbmZpZyhyZXF1aXJlKCcuL3JvdXRlcycpLmxheW91dFJvdXRlcylcbiAgICAucnVuKHJlcXVpcmUoJy4vc2VydmljZXMnKS5SdW5BcHApOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIGxheW91dFJvdXRlcygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2xheW91dCcsIHtcbiAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xheW91dC5odG1sJyksXG4gICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkxheW91dENvbnRyb2xsZXIsXG4gICAgICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICAgICAgdHJla3MgOiBmdW5jdGlvbih0cmVrc1NlcnZpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRyZWtzU2VydmljZS5nZXRUcmVrcygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdyb290Jywge1xuICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnaGVhZGVyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2hlYWRlci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuSGVhZGVyQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3NpZGViYXInIDoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvc2lkZWJhci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuU2lkZWJhckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdjb250ZW50JyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sJyksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnZm9vdGVyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2Zvb3Rlci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuRm9vdGVyQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxheW91dFJvdXRlczogbGF5b3V0Um91dGVzXG59OyIsIid1c2Ugc3RyaWN0JztcblxuXG5mdW5jdGlvbiBSdW5BcHAoKSB7XG4gICAgY29uc29sZS5sb2coJ2FwcCBzdGFydGVkJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFJ1bkFwcDogUnVuQXBwXG59OyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyZXN1bHRzLWRyYXdlclwiPlxcbiAgICA8dHJla3MtbGlzdGU+PC90cmVrcy1saXN0ZT4gICAgXFxuPC9kaXY+XFxuPGdlb3RyZWstbWFwPjwvZ2VvdHJlay1tYXA+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XFxuXFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCIgcm9sZT1cIm5hdmlnYXRpb25cIj5cXG4gICAgPGRpdiBpZD1cImxvZ29cIj5Mb2dvPC9kaXY+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGlkPVwiaGVhZGVyXCIgdWktdmlldz1cImhlYWRlclwiPjwvZGl2PlxcbjxkaXYgaWQ9XCJtYWluLWNvbnRlbnRcIiBjbGFzcz1cImZsdWlkLWNvdGFpbmVyXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gICAgICAgIDxkaXYgaWQ9XCJzaWRlYmFyXCIgdWktdmlldz1cInNpZGViYXJcIiBjbGFzcz1cImNvbC1zbS0xXCI+PC9kaXY+XFxuICAgICAgICA8ZGl2IHVpLXZpZXc9XCJjb250ZW50XCIgY2xhc3M9XCJjb2wtc20tMTEgY29udGVudFwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGlkPVwiZm9vdGVyXCIgdWktdmlldz1cImZvb3RlclwiPjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG48L2Rpdj4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTWFwQ29udHJvbGxlcigkc2NvcGUsIHNldHRpbmdzRmFjdG9yeSwgbWFwU2VydmljZSwgaWNvbnNTZXJ2aWNlKSB7XG4gICAgXG4gICAgdmFyIG1hcCwgdHJla3NMYXllcjtcblxuICAgIHZhciB0cmVrcyA9ICRzY29wZS50cmVrcztcblxuICAgIGZ1bmN0aW9uIG1hcEluaXQobWFwSWQpIHtcblxuICAgICAgICB2YXIgbWFwUGFyYW1ldGVycyA9IG1hcFNlcnZpY2UuZ2V0TWFwSW5pdFBhcmFtZXRlcnMoKTtcblxuICAgICAgICBtYXAgPSBMLm1hcChtYXBJZCwgbWFwUGFyYW1ldGVycyk7XG5cbiAgICAgICAgdHJla3NMYXllciA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCh7XG4gICAgICAgICAgICBzaG93Q292ZXJhZ2VPbkhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIGljb25DcmVhdGVGdW5jdGlvbjogZnVuY3Rpb24oY2x1c3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBpY29uc1NlcnZpY2UuZ2V0Q2x1c3Rlckljb24oY2x1c3Rlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUudHJla3NMYXllciA9IHRyZWtzTGF5ZXI7XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgc2NhbGUgYW5kIGF0dHJpYnV0aW9uIGNvbnRyb2xzXG4gICAgICAgIG1hcFNlcnZpY2Uuc2V0U2NhbGUobWFwKTtcbiAgICAgICAgbWFwU2VydmljZS5zZXRBdHRyaWJ1dGlvbihtYXApO1xuICAgICAgICBzaG93VHJla3MoKTtcblxuICAgIH1cblxuICAgICAvLyBBZGQgdHJla3MgZ2VvanNvbiB0byB0aGUgbWFwXG4gICAgZnVuY3Rpb24gc2hvd1RyZWtzKCkge1xuICAgICAgICAvLyBSZW1vdmUgYWxsIG1hcmtlcnMgc28gdGhlIGRpc3BsYXllZCBtYXJrZXJzIGNhbiBmaXQgdGhlIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIHRyZWtzTGF5ZXIuY2xlYXJMYXllcnMoKTtcblxuICAgICAgICAvLyRzY29wZS5tYXBTZXJ2aWNlID0gbWFwU2VydmljZTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzLmZlYXR1cmVzLypmaWx0ZXJGaWx0ZXIoJHJvb3RTY29wZS5maWx0ZXJlZFRyZWtzLCAkc2NvcGUuYWN0aXZlRmlsdGVycy5zZWFyY2gpKi8sIGZ1bmN0aW9uKHRyZWspIHtcbiAgICAgICAgICAgIHZhciB0cmVrRGVwYXJ0dXJlID0gbWFwU2VydmljZS5jcmVhdGVDbHVzdGVyTWFya2VyRnJvbVRyZWsodHJlayk7XG4gICAgICAgICAgICB0cmVrRGVwYXJ0dXJlLm9uKHtcbiAgICAgICAgICAgICAgICBjbGljazogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbWFya2VyIENsaWNrZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8kc3RhdGUuZ28oXCJob21lLm1hcC5kZXRhaWxcIiwgeyB0cmVrSWQ6IHRyZWsuaWQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmVrc0xheWVyLmFkZExheWVyKHRyZWtEZXBhcnR1cmUpO1xuICAgICAgICB9KTtcbiAgICAgICAgbWFwLmFkZExheWVyKHRyZWtzTGF5ZXIpO1xuXG4gICAgICAgIC8qaWYgKCh1cGRhdGVCb3VuZHMgPT0gdW5kZWZpbmVkKSB8fCAodXBkYXRlQm91bmRzID09IHRydWUpKSB7ICAgIFxuICAgICAgICAgICAgbWFwLmZpdEJvdW5kcyh0cmVrc0xheWVyLmdldEJvdW5kcygpKTtcbiAgICAgICAgfSovXG4gICAgfTtcblxuICAgIG1hcEluaXQoJ21hcCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBNYXBDb250cm9sbGVyIDogTWFwQ29udHJvbGxlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250cm9sbGVycyA9IHJlcXVpcmUoJy4vY29udHJvbGxlcnMnKTtcblxuZnVuY3Rpb24gbWFwRGlyZWN0aXZlKCkge1xuICAgIGNvbnNvbGUubG9nKCdtYXAgbG9hZGluZycpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9tYXAuaHRtbCcpLFxuICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVycy5NYXBDb250cm9sbGVyXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbWFwRGlyZWN0aXZlOiBtYXBEaXJlY3RpdmVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby5tYXAnLCBbXSlcbiAgICAuc2VydmljZSgnbWFwU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5tYXBTZXJ2aWNlKVxuICAgIC5zZXJ2aWNlKCdpY29uc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykuaWNvbnNTZXJ2aWNlKVxuICAgIC5jb250cm9sbGVyKCdNYXBDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLk1hcENvbnRyb2xsZXIpXG4gICAgLmRpcmVjdGl2ZSgnZ2VvdHJla01hcCcsIHJlcXVpcmUoJy4vZGlyZWN0aXZlcycpLm1hcERpcmVjdGl2ZSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBtYXBTZXJ2aWNlKCRxLCBzZXR0aW5nc0ZhY3RvcnksIHRyZWtzU2VydmljZSwgaWNvbnNTZXJ2aWNlKSB7XG5cbiAgICB2YXIgX21hcmtlcnMgPSBbXTtcblxuICAgIHRoaXMuZ2V0TWFya2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gX21hcmtlcnM7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0TWFya2VycyA9IGZ1bmN0aW9uKG1hcmtlcnMpIHtcbiAgICAgICAgX21hcmtlcnMgPSBtYXJrZXJzO1xuICAgIH07XG5cbiAgICB0aGlzLmdldE1hcEluaXRQYXJhbWV0ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIFNldCBkZWZhdWx0IExlYWZsZXQgbWFwIHBhcmFtc1xuXG4gICAgICAgIHZhciBtYXBfcGFyYW1ldGVycyA9IHtcbiAgICAgICAgICAgIGNlbnRlcjogW3NldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuQ0VOVEVSX0xBVElUVURFLCBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkNFTlRFUl9MT05HSVRVREVdLFxuICAgICAgICAgICAgem9vbTogc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5ERUZBVUxUX1pPT00sXG4gICAgICAgICAgICBtaW5ab29tOiBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkRFRkFVTFRfTUlOX1pPT00sXG4gICAgICAgICAgICBtYXhab29tOiBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkRFRkFVTFRfTUFYX1pPT00sXG4gICAgICAgICAgICBzY3JvbGxXaGVlbFpvb206IHRydWUsXG4gICAgICAgICAgICB6b29tQ29udHJvbDogZmFsc2UsXG4gICAgICAgICAgICBsYXllcnM6IEwudGlsZUxheWVyKHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0JBQ0tHUk9VTkRfVVJMKVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBtYXBfcGFyYW1ldGVycztcbiAgICB9O1xuXG4gICAgdGhpcy5jcmVhdGVNYXJrZXJzRnJvbVRyZWsgPSBmdW5jdGlvbih0cmVrLCBwb2lzKSB7XG4gICAgICAgIHZhciBtYXJrZXJzID0gW107XG5cbiAgICAgICAgdmFyIHN0YXJ0UG9pbnQgPSB0cmVrc1NlcnZpY2UuZ2V0U3RhcnRQb2ludCh0cmVrKTtcbiAgICAgICAgdmFyIGVuZFBvaW50ID0gdHJla3NTZXJ2aWNlLmdldEVuZFBvaW50KHRyZWspO1xuICAgICAgICB2YXIgcGFya2luZ1BvaW50ID0gdHJla3NTZXJ2aWNlLmdldFBhcmtpbmdQb2ludCh0cmVrKTtcblxuICAgICAgICBtYXJrZXJzLnB1c2goTC5tYXJrZXIoW2VuZFBvaW50LmxhdCwgZW5kUG9pbnQubG5nXSwge1xuICAgICAgICAgICAgaWNvbjogaWNvbnNTZXJ2aWNlLmdldEFycml2YWxJY29uKCksXG4gICAgICAgICAgICBuYW1lOiB0cmVrLnByb3BlcnRpZXMuYXJyaXZhbCxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIG1hcmtlcnMucHVzaChMLm1hcmtlcihbc3RhcnRQb2ludC5sYXQsIHN0YXJ0UG9pbnQubG5nXSwge1xuICAgICAgICAgICAgaWNvbjogaWNvbnNTZXJ2aWNlLmdldERlcGFydHVyZUljb24oKSxcbiAgICAgICAgICAgIG5hbWU6IHRyZWsucHJvcGVydGllcy5kZXBhcnR1cmUsXG4gICAgICAgIH0pKTtcblxuICAgICAgICBpZihwYXJraW5nUG9pbnQpIHtcbiAgICAgICAgICAgIG1hcmtlcnMucHVzaChMLm1hcmtlcihbcGFya2luZ1BvaW50LmxhdCwgcGFya2luZ1BvaW50LmxuZ10sIHtcbiAgICAgICAgICAgIGljb246IGljb25zU2VydmljZS5nZXRQYXJraW5nSWNvbigpLFxuICAgICAgICAgICAgbmFtZTogXCJQYXJraW5nXCIsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdHJlay5wcm9wZXJ0aWVzLmFkdmlzZWRfcGFya2luZyxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaW5mb3JtYXRpb25Db3VudCA9IDA7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMuaW5mb3JtYXRpb25fZGVza3MsIGZ1bmN0aW9uKGluZm9ybWF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaW5mb3JtYXRpb25EZXNjcmlwdGlvbiA9IFwiPHA+XCIgKyBpbmZvcm1hdGlvbi5kZXNjcmlwdGlvbiArIFwiPC9wPlwiXG4gICAgICAgICAgICAgICAgKyBcIjxwPlwiICsgaW5mb3JtYXRpb24uc3RyZWV0ICsgXCI8L3A+XCJcbiAgICAgICAgICAgICAgICArIFwiPHA+XCIgKyBpbmZvcm1hdGlvbi5wb3N0YWxfY29kZSArIFwiIFwiICsgaW5mb3JtYXRpb24ubXVuaWNpcGFsaXR5ICsgXCI8L3A+XCJcbiAgICAgICAgICAgICAgICArIFwiPHA+PGEgaHJlZj0nXCIgKyBpbmZvcm1hdGlvbi53ZWJzaXRlICsgXCInPldlYjwvYT4gLSA8YSBocmVmPSd0ZWw6XCIgKyBpbmZvcm1hdGlvbi5waG9uZSArIFwiJz5cIiArIGluZm9ybWF0aW9uLnBob25lICsgXCI8L2E+PC9wPlwiO1xuXG4gICAgICAgICAgICBtYXJrZXJzLnB1c2goTC5tYXJrZXIoW2luZm9ybWF0aW9uLmxhdGl0dWRlLCBpbmZvcm1hdGlvbi5sb25naXR1ZGVdLCB7XG4gICAgICAgICAgICAgICAgaWNvbjogaWNvbnNTZXJ2aWNlLmdldEluZm9ybWF0aW9uSWNvbigpLFxuICAgICAgICAgICAgICAgIG5hbWU6IGluZm9ybWF0aW9uLm5hbWUsXG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsOiBpbmZvcm1hdGlvbi5waG90b191cmwsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGluZm9ybWF0aW9uRGVzY3JpcHRpb24sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICBpbmZvcm1hdGlvbkNvdW50ICs9IDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwb2lzLCBmdW5jdGlvbihwb2kpIHtcbiAgICAgICAgICAgIHZhciBwb2lDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgJ2xhdCc6IHBvaS5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogcG9pLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHBvaUljb24gPSBpY29uc1NlcnZpY2UuZ2V0UE9JSWNvbihwb2kpO1xuICAgICAgICAgICAgbWFya2Vycy5wdXNoKEwubWFya2VyKFtwb2lDb29yZHMubGF0LCBwb2lDb29yZHMubG5nXSwge1xuICAgICAgICAgICAgICAgIGljb246IHBvaUljb24sXG4gICAgICAgICAgICAgICAgbmFtZTogcG9pLnByb3BlcnRpZXMubmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcG9pLnByb3BlcnRpZXMuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsOiBwb2kucHJvcGVydGllcy50aHVtYm5haWwsXG4gICAgICAgICAgICAgICAgaW1nOiBwb2kucHJvcGVydGllcy5waWN0dXJlc1swXSxcbiAgICAgICAgICAgICAgICBwaWN0b2dyYW06IHBvaS5wcm9wZXJ0aWVzLnR5cGUucGljdG9ncmFtXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXJrZXJzO1xuICAgIH07XG5cbiAgICB0aGlzLmNyZWF0ZUNsdXN0ZXJNYXJrZXJGcm9tVHJlayA9IGZ1bmN0aW9uKHRyZWspIHtcbiAgICAgICAgdmFyIHN0YXJ0UG9pbnQgPSB0cmVrc1NlcnZpY2UuZ2V0U3RhcnRQb2ludCh0cmVrKTtcblxuICAgICAgICB2YXIgbWFya2VyID0gTC5tYXJrZXIoW3N0YXJ0UG9pbnQubGF0LCBzdGFydFBvaW50LmxuZ10sIHtcbiAgICAgICAgICAgIGljb246IGljb25zU2VydmljZS5nZXRUcmVrSWNvbigpXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXJrZXI7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0U2NhbGUgPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgTC5jb250cm9sLnNjYWxlKHtpbXBlcmlhbDogZmFsc2V9KS5hZGRUbyhtYXApO1xuICAgIH07XG5cbiAgICB0aGlzLnNldEF0dHJpYnV0aW9uID0gZnVuY3Rpb24obWFwKSB7XG4gICAgICAgIG1hcC5hdHRyaWJ1dGlvbkNvbnRyb2wuc2V0UHJlZml4KHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuQVRUUklCVVRJT04pO1xuICAgIH07XG5cbiAgICB0aGlzLnNldFBvc2l0aW9uTWFya2VyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy8gUHVsc2luZyBtYXJrZXIgaW5zcGlyZWQgYnlcbiAgICAgICAgLy8gaHR0cDovL2Jsb2cudGhlbWF0aWNtYXBwaW5nLm9yZy8yMDE0LzA2L3JlYWwtdGltZS10cmFja2luZy13aXRoLXNwb3QtYW5kLWxlYWZldC5odG1sXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIGZpbGxDb2xvcjogJyM5ODFkOTcnLFxuICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlTWFya2VyJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2xlYWZsZXQtbGl2ZS11c2VyJyxcbiAgICAgICAgICAgIHdlaWdodDogMlxuICAgICAgICB9O1xuICAgIH1cblxufVxuXG5mdW5jdGlvbiBpY29uc1NlcnZpY2UoJHdpbmRvdykge1xuXG4gICAgdmFyIHRyZWtfaWNvbnMgPSB7XG4gICAgICAgIGRlZmF1bHRfaWNvbjoge30sXG4gICAgICAgIGRlcGFydHVyZV9pY29uOiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9tYXJrZXItc291cmNlLnBuZycsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzY0LCA2NF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMzIsIDY0XSxcbiAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBbMjAsIC01MF1cbiAgICAgICAgfSksXG4gICAgICAgIGFycml2YWxfaWNvbjogTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvbWFya2VyLXRhcmdldC5wbmcnLFxuICAgICAgICAgICAgaWNvblNpemU6IFs2NCwgNjRdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzMyLCA2NF0sXG4gICAgICAgICAgICBsYWJlbEFuY2hvcjogWzIwLCAtNTBdXG4gICAgICAgIH0pLFxuICAgICAgICBwYXJraW5nX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL3BhcmtpbmcucG5nJyxcbiAgICAgICAgICAgIGljb25TaXplOiBbMzIsIDMyXSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFsxNiwgMTZdXG4gICAgICAgIH0pLFxuICAgICAgICBpbmZvcm1hdGlvbl9pY29uOiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9pbmZvcm1hdGlvbi5zdmcnLFxuICAgICAgICAgICAgaWNvblNpemU6IFszMiwgMzJdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzE2LCAxNl1cbiAgICAgICAgfSksXG4gICAgICAgIHBvaV9pY29uOiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblNpemU6IFs0MCwgNDBdLFxuICAgICAgICAgICAgbGFiZWxBbmNob3I6IFsyMCwgLTUwXVxuICAgICAgICB9KSxcbiAgICAgICAgdHJla19pY29uOiBMLmRpdkljb24oe1xuICAgICAgICAgICAgaWNvblNpemU6IFs0MCwgNDBdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzIwLCAyMF0sXG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0cmVrLWljb24nLFxuICAgICAgICAgICAgbGFiZWxBbmNob3I6IFsyMCwgMF1cbiAgICAgICAgfSlcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRQT0lJY29uID0gZnVuY3Rpb24ocG9pKSB7XG4gICAgICAgIHZhciBwaWN0b2dyYW1VcmwgPSBwb2kucHJvcGVydGllcy50eXBlLnBpY3RvZ3JhbTtcblxuICAgICAgICByZXR1cm4gTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6IHBpY3RvZ3JhbVVybCxcbiAgICAgICAgICAgIGljb25TaXplOiBbMzIsIDMyXSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFsxNiwgMTZdXG4gICAgICAgIH0pXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q2x1c3Rlckljb24gPSBmdW5jdGlvbihjbHVzdGVyKSB7XG4gICAgICAgIHJldHVybiBuZXcgTC5EaXZJY29uKHtcbiAgICAgICAgICAgIGljb25TaXplOiBbNDAsIDQwXSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFsyMCwgMjBdLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAndHJlay1jbHVzdGVyJyxcbiAgICAgICAgICAgIGh0bWw6ICc8c3BhbiBjbGFzcz1cImNvdW50XCI+JyArIGNsdXN0ZXIuZ2V0Q2hpbGRDb3VudCgpICsgJzwvc3Bhbj4nXG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICB0aGlzLmdldERlcGFydHVyZUljb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRyZWtfaWNvbnMuZGVwYXJ0dXJlX2ljb247XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0QXJyaXZhbEljb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRyZWtfaWNvbnMuYXJyaXZhbF9pY29uO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFBhcmtpbmdJY29uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cmVrX2ljb25zLnBhcmtpbmdfaWNvbjtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRJbmZvcm1hdGlvbkljb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRyZWtfaWNvbnMuaW5mb3JtYXRpb25faWNvbjtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRUcmVrSWNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy50cmVrX2ljb247XG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYXBTZXJ2aWNlOiBtYXBTZXJ2aWNlLFxuICAgIGljb25zU2VydmljZTogaWNvbnNTZXJ2aWNlXG59OyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgaWQ9XCJtYXBcIj5cXG5cXG48L2Rpdj4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gVHJla3NMaXN0ZUNvbnRyb2xsZXIoJHNjb3BlKSB7XG4gICAgXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVHJla3NMaXN0ZUNvbnRyb2xsZXI6IFRyZWtzTGlzdGVDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiB0cmVrc0xpc3RlRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLlRyZWtzTGlzdGVDb250cm9sbGVyXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NMaXN0ZURpcmVjdGl2ZTogdHJla3NMaXN0ZURpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLnRyZWtzJywgW10pXG4gICAgLnNlcnZpY2UoJ3RyZWtzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS50cmVrc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ1RyZWtzTGlzdGVDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLlRyZWtzTGlzdGVDb250cm9sbGVyKVxuICAgIC5kaXJlY3RpdmUoJ3RyZWtzTGlzdGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKS50cmVrc0xpc3RlRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHRyZWtzU2VydmljZShzZXR0aW5nc0ZhY3RvcnksICRyZXNvdXJjZSwgJHEpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuZ2V0U3RhcnRQb2ludCA9IGZ1bmN0aW9uKHRyZWspIHtcbiAgICAgICAgY29uc29sZS5sb2codHJlayk7XG4gICAgICAgIHZhciBmaXJzdFBvaW50Q29vcmRpbmF0ZXMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdO1xuXG4gICAgICAgIHJldHVybiB7J2xhdCc6IGZpcnN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogZmlyc3RQb2ludENvb3JkaW5hdGVzWzBdfVxuICAgIH07XG5cbiAgICB0aGlzLmdldEVuZFBvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgbmJQdHMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGxhc3RQb2ludENvb3JkaW5hdGVzID0gdHJlay5nZW9tZXRyeS5jb29yZGluYXRlc1tuYlB0cy0xXTtcblxuICAgICAgICByZXR1cm4geydsYXQnOiBsYXN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogbGFzdFBvaW50Q29vcmRpbmF0ZXNbMF19XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0UGFya2luZ1BvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgcGFya2luZ0Nvb3JkaW5hdGVzID0gdHJlay5wcm9wZXJ0aWVzLnBhcmtpbmdfbG9jYXRpb247XG5cbiAgICAgICAgcmV0dXJuIHBhcmtpbmdDb29yZGluYXRlcyA/IHsnbGF0JzogcGFya2luZ0Nvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgICAgICdsbmcnOiBwYXJraW5nQ29vcmRpbmF0ZXNbMF19IDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnJlcGxhY2VJbWdVUkxzID0gZnVuY3Rpb24gKHRyZWtzRGF0YSkgeyAgICAgICAgXG5cbiAgICAgICAgLy8gUGFyc2UgdHJlayBwaWN0dXJlcywgYW5kIGNoYW5nZSB0aGVpciBVUkxcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzRGF0YS5mZWF0dXJlcywgZnVuY3Rpb24odHJlaykge1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5waWN0dXJlcywgZnVuY3Rpb24ocGljdHVyZSnCoHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlLnVybCA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyBwaWN0dXJlLnVybDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy51c2FnZXMsIGZ1bmN0aW9uKHVzYWdlKcKge1xuICAgICAgICAgICAgICAgIHVzYWdlLnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB1c2FnZS5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMudGhlbWVzLCBmdW5jdGlvbih0aGVtZSnCoHtcbiAgICAgICAgICAgICAgICB0aGVtZS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdGhlbWUucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLm5ldHdvcmtzLCBmdW5jdGlvbihuZXR3b3JrKcKge1xuICAgICAgICAgICAgICAgIG5ldHdvcmsucGljdG9ncmFtID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIG5ldHdvcmsucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmluZm9ybWF0aW9uX2Rlc2tzLCBmdW5jdGlvbihpbmZvcm1hdGlvbl9kZXNrKcKge1xuICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMudGh1bWJuYWlsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHRyZWsucHJvcGVydGllcy50aHVtYm5haWw7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkucGljdG9ncmFtO1xuICAgICAgICAgICAgdHJlay5wcm9wZXJ0aWVzLmFsdGltZXRyaWNfcHJvZmlsZSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0cmVrLnByb3BlcnRpZXMuYWx0aW1ldHJpY19wcm9maWxlLnJlcGxhY2UoXCIuanNvblwiLCBcIi5zdmdcIik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJla3NEYXRhO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3RyZWtMaXN0KSB7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2VsZi5fdHJla0xpc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gc2V0dGluZ3NGYWN0b3J5LnRyZWtzVXJsO1xuXG4gICAgICAgICAgICB2YXIgcmVxdWVzdHMgPSAkcmVzb3VyY2UodXJsLCB7fSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RzLnF1ZXJ5KCkuJHByb21pc2VcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGFuZ3VsYXIuZnJvbUpzb24oZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0ZWRJbWdzID0gc2VsZi5yZXBsYWNlSW1nVVJMcyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fdHJla0xpc3QgPSBjb252ZXJ0ZWRJbWdzO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbnZlcnRlZEltZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgIH07XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NTZXJ2aWNlOiB0cmVrc1NlcnZpY2Vcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAnPHNlY3Rpb24gY2xhc3M9XCJ0cmVrcy1saXN0ZVwiPlxcbiAgICA8YXJ0aWNsZSBuZy1yZXBlYXQ9XCJ0cmVrIGluIHRyZWtzLmZlYXR1cmVzXCIgbmctaWQ9XCJ0cmVrLXt7dHJlay5pZH19XCIgY2xhc3M9XCJ0cmVrIGNvbC1zbS0xMiBjb2wtbWQtNlwiPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cInZpc3VhbFwiPlxcbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmYXYtb3Itbm90XCI+XFxuICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1oZWFydFwiPjwvaT5cXG4gICAgICAgICAgICA8L2Rpdj5cXG4gICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7dHJlay5wcm9wZXJ0aWVzLnBpY3R1cmVzWzBdLnVybH19XCIgbmctYWx0PVwie3t0cmVrLnByb3BlcnRpZXMucGljdHVyZXNbMF0udGl0bGV9fVwiPiAgICBcXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPGgxIGNsYXNzPVwidGl0bGVcIj57e3RyZWsucHJvcGVydGllcy5uYW1lfX08L2gxPlxcbiAgICAgICAgPGRpdiBjbGFzcz1cImluZm9zXCI+XFxuICAgICAgICAgICAgPHNwYW4+e3t0cmVrLnByb3BlcnRpZXMuZGlzdHJpY3RzWzBdLm5hbWV9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy5kdXJhdGlvbl9wcmV0dHl9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj5Ew6luaXZlbMOpIHt7dHJlay5wcm9wZXJ0aWVzLmFzY2VudH19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkubGFiZWx9fSAtIDwvc3Bhbj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy51c2FnZXNbMF0ubGFiZWx9fTwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcbiAgICAgICAgPHVsIGNsYXNzPVwidGhlbWVzXCI+XFxuICAgICAgICAgICAgPGxpIG5nLXJlcGVhdD1cInRoZW1lIGluIHRyZWsucHJvcGVydGllcy50aGVtZXNcIj5cXG4gICAgICAgICAgICAgICAgPGltZyBuZy1zcmM9XCJ7e3RoZW1lLnBpY3RvZ3JhbX19XCIgbmctYWx0PVwie3t0aGVtZS5sYWJlbH19XCI+XFxuICAgICAgICAgICAgPC9saT5cXG4gICAgICAgIDwvdWw+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwia25vdy1tb3JlXCI+XFxuICAgICAgICAgICAgPHNwYW4+Kzwvc3Bhbj5cXG4gICAgICAgIDwvZGl2PlxcblxcbiAgICA8L2FydGljbGU+XFxuPC9zZWN0aW9uPic7Il19
