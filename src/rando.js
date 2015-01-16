(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/app/app.js":[function(require,module,exports){
'use strict';

var dependencies = [
    // Our submodules
    'rando.config', 'rando.treks', 'rando.layout', 'rando.map', 'rando.filters',

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
require('./filters');

},{"./config":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/index.js","./filters":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/filters/index.js","./layout":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/index.js","./map":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/map/index.js","./treks":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/index.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js":[function(require,module,exports){
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
    var treksUrl =  DOMAIN + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE,
        filters = {
            durations : [
                { id: 4, name: '<1/2 J', interval: [0, 4]},
                { id: 10, name: '1/2 - 1', interval: [4, 10] },
                { id: 24, name: '> 1 J', interval: [10, 99999]}
            ],
            elevations :  [
                { id: 0, name: '<300m', interval: [0, 300] },
                { id: 300, name: '300-600', interval: [301, 600] },
                { id: 600, name: '600-1000', interval: [601, 1000] },
                { id: 1000, name: '>1000m', interval: [1001, 99999] }
            ]
        };

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
        filters: filters,

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
},{"./factories":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/config/factories.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/filters/index.js":[function(require,module,exports){
'use strict';

angular.module('rando.filters', [])
    .service('filtersService', require('./services').filtersService);
},{"./services":"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/filters/services.js"}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/filters/services.js":[function(require,module,exports){
'use strict';

function filtersService($q, $sce, settingsFactory) {

    var self = this;

    // Get default value for each filter field
    this.getDefaultActiveFilterValues = function() {
        return {
            difficulty:   {},
            duration:     {},
            elevation:    {},
            download:     undefined,
            theme:        undefined,
            municipality: null,
            use:          null,
            valley:       null,
            route:        null,
            search:       ''
        }
    };

    this.isValidFilter = function(value, filter) {
        var valid = true;
        if (angular.isUndefined(value)
            || angular.isUndefined(filter)
            || (filter === null)
            || (value === null)
            || (angular.equals(filter, {})))
            {
                valid = false;
            }
        return valid;
    };

    // Generic function that is called on hardcoded filters
    this.filterTrekWithFilter = function(trekValue, filter) {

        // Trek considered as matching if filter not set or if
        // property is empty.
        var is_valid = true;

        if (this.isValidFilter(trekValue, filter)) {
            if(angular.isNumber(filter)){
                is_valid = trekValue <= filter;
            }
            else{
                var keys = Object.keys(filter);
                for (var i = 0; i < keys.length; i++) {
                    if (filter[keys[i]] === true ){
                        // In combined filters if one filter is valid, no need to look on the other
                        // OR operator
                        if (trekValue <= parseFloat(keys[i])){
                            return true;
                        }
                        else{
                            is_valid = false;
                        }
                    }
                };
            }
        }
        return is_valid;
    };

    // Generic function that is called on hardcoded range filters
    this.filterTrekWithInterval = function(trekValue, filters) {
        var is_valid = true;
        var keys = Object.keys(filters);
        for (var i = 0; i < keys.length; i++) {
            var filter = filters[keys[i]];
            if (filter.checked === true ){
                // In combined filters if one filter is valid, no need to look on the other
                // OR operator
                if (parseFloat(trekValue) >= parseFloat(filter.interval[0]) && parseFloat(trekValue) <= parseFloat(filter.interval[1])){
                    return true;
                }
                else{
                    is_valid = false;
                }
            }
        };
        return is_valid;
    };

    // Generic function that is called on hardcoded filters
    this.filterTrekEquals = function(trekValue, filter) {

        var is_valid = true;
        if (this.isValidFilter(trekValue, filter)) {
            if(angular.isNumber(filter)){
                is_valid = trekValue === filter;
            }
            else{
                var keys = Object.keys(filter);
                for (var i = 0; i < keys.length; i++) {
                    if (filter[keys[i]] === true ){
                        // In combined filters if one filter is valid, no need to look on the other
                        // OR operator
                        if (parseFloat(trekValue) === parseFloat(keys[i])){
                            return true;
                        }
                        else{
                            is_valid = false;
                        }
                    }
                };
            }
        }
        return is_valid;
    };

    // Generic function that is called on select filters
    this.filterTrekWithSelect = function(selectOptionValues, formValue, fieldToCheck) {
        // Trek considered as matching if filter not set or if
        // property is empty.
        if (!(this.isValidFilter(selectOptionValues, formValue))) {
            return true;
        }

        if (!angular.isArray(selectOptionValues)) {
            selectOptionValues = [selectOptionValues];
        }

        // Using native loops instead of angularjs forEach because we want to stop searching
        // when value has been found
        for (var i=0; i<selectOptionValues.length; i++) {
            var fieldValue = selectOptionValues[i][fieldToCheck];
            if (angular.isUndefined(fieldValue) || (fieldValue === formValue.value)) {
                return true;
            }
        };

        return false;
    };

    // Function called each time a filter is modified, to know which treks to display
    this.filterTreks = function(treks, activeFilters) {
        var filteredTreks = [];
        angular.forEach(treks, function(trek) {
            if (self.filterTrekEquals(trek.properties.difficulty.id, activeFilters.difficulty) &&
            self.filterTrekWithInterval(trek.properties.duration, activeFilters.duration) &&
            self.filterTrekWithInterval(trek.properties.ascent, activeFilters.elevation) &&
            self.filterTrekEquals((trek.tiles && trek.tiles.isDownloaded) ? 1 : 0, activeFilters.download) &&
            self.filterTrekWithSelect(trek.properties.themes, activeFilters.theme, 'id') &&
            self.filterTrekWithSelect(trek.properties.usages, activeFilters.use, 'id') &&
            self.filterTrekWithSelect(trek.properties.route, activeFilters.route, 'id') &&
            self.filterTrekWithSelect(trek.properties.districts, activeFilters.valley, 'id') &&
            self.filterTrekWithSelect(trek.properties.cities, activeFilters.municipality, 'code')) {
                filteredTreks.push(trek);
            };
        });
        return filteredTreks;
    };


    // Remove filter duplicates that have the same "value"
    this.removeFilterDuplicates = function(array) {

        var dict = {}, result=[];
        for (var i=0; i<array.length; i++) {
            var currentValue = array[i].value;
            dict[currentValue] = array[i];
        }
        var dictKeys = Object.keys(dict);
        for (var i=0; i<dictKeys.length; i++) {
            result.push(dict[dictKeys[i]]);
        }

        return result;
    };

    // Sort filter values by their name
    this.sortFilterNames = function(array) {
        array.sort(function(a, b) {
            var nameA = a.name;
            var nameB = b.name;
            return (nameA < nameB) ? -1 : (nameA > nameB) ? 1 : 0;
        });

        return array;
    };

    // Sort filter values by their value
    this.sortFilterValues = function(array) {
        array.sort(function(a, b) {
            var valueA = a.value;
            var valueB = b.value;
            return (valueA < valueB) ? -1 : (valueA > valueB) ? 1 : 0;
        });

        return array;
    };

    // Possible values that user can select on filter sidebar menu.
    // Some are constants defined in settings (durations, elevations),
    // others come from trek possible values
    this.getTrekFilterOptions = function(treks) {

        var trekThemes = [],
            trekUses = [],
            trekRoute = [],
            trekValleys = [],
            trekMunicipalities = [],
            trekDifficulties = [];

        angular.forEach(treks.features, function(trek) {

            // Themes init
            angular.forEach(trek.properties.themes, function(theme) {
                trekThemes.push({value: theme.id, name: theme.label});
            });

            // Diffulties init
            var difficulty = trek.properties.difficulty;
            trekDifficulties.push({value: difficulty.id, name: difficulty.label, icon: $sce.trustAsResourceUrl(difficulty.pictogram)});

            // Uses init
            angular.forEach(trek.properties.usages, function(usage) {
                trekUses.push({value: usage.id, name: usage.label});
            });

            // Route init
            var route = trek.properties.route;
            trekRoute.push({value: route.id, name: route.label});

            // Valleys init
            angular.forEach(trek.properties.districts, function(district) {
                trekValleys.push({value: district.id, name: district.name});
            });

            // Municipalities init
            angular.forEach(trek.properties.cities, function(city) {
                trekMunicipalities.push({value: city.code, name: city.name});
            });
        });

        // Removing possible values duplicates
        trekThemes = this.removeFilterDuplicates(trekThemes);
        trekUses = this.removeFilterDuplicates(trekUses);
        trekRoute = this.removeFilterDuplicates(trekRoute);
        trekValleys = this.removeFilterDuplicates(trekValleys);
        trekMunicipalities = this.removeFilterDuplicates(trekMunicipalities);
        trekDifficulties =  this.removeFilterDuplicates(trekDifficulties);

        // Sort values by their name
        trekThemes = this.sortFilterNames(trekThemes);
        trekUses = this.sortFilterNames(trekUses);
        trekRoute = this.sortFilterNames(trekRoute);
        trekValleys = this.sortFilterNames(trekValleys);
        trekMunicipalities = this.sortFilterNames(trekMunicipalities);
        trekDifficulties = this.sortFilterValues(trekDifficulties);

        return {
            difficulties : trekDifficulties,
            durations : settingsFactory.filters.durations,
            elevations :  settingsFactory.filters.elevations,
            downloads : [
                { value: 1, name: 'nav_trek_map.offline', icon: 'icon_offline.svg' }
            ],
            themes : trekThemes,
            uses: trekUses,
            routes: trekRoute,
            valleys: trekValleys,
            municipalities: trekMunicipalities
        }
    };
}

module.exports = {
    filtersService : filtersService
}
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/layout/controllers.js":[function(require,module,exports){
'use strict';

function LayoutController() {

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
            controller: controller.LayoutController
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

function MapController($scope, settingsFactory, mapService, iconsService, treksService) {
    
    var map, treksLayer;

    function updateTreks(callback) {
        treksService.getTreks()
        .then(
            function(data) {
                $scope.treks = data;
                if (callback && typeof callback[0] === 'function') {
                    callback[0](callback[1]);
                }
            }
        );
    }

    function mapInit(parameters) {
        var mapParameters = mapService.getMapInitParameters(),
            mapSelector = parameters[0] || 'map';

        map = L.map(mapSelector, mapParameters);

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
        angular.forEach($scope.treks.features/*filterFilter($rootScope.filteredTreks, $scope.activeFilters.search)*/, function(trek) {
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

    updateTreks([mapInit,['map']]);
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

function TreksListeController($scope, treksService) {

    function updateTreks() {
        treksService.getTreks()
        .then(
            function(data) {
                $scope.treks = data;
            }
        );
    }

    updateTreks();
        
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

function treksService(settingsFactory, $resource, $q, filtersService) {

    var self = this;

    this.getStartPoint = function(trek) {
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

    this.filterTreks = function () {
        var deferred = $q.defer();

        filteredTreks = filtersService.filterTreks();
        deferred.resolve(filteredTreks);


        return deferred.promise;
    };

}

module.exports = {
    treksService: treksService
};
},{}],"/Volumes/Stock/Works/geotrek/rando-v2/dev/rando-v2/src/app/treks/templates/treks-liste.html":[function(require,module,exports){
module.exports = '<section class="treks-liste">\n    <article ng-repeat="trek in treks.features" ng-id="trek-{{trek.id}}" class="trek col-sm-12 col-md-6">\n        <div class="visual">\n            <div class="fav-or-not">\n                <i class="glyphicon glyphicon-heart"></i>\n            </div>\n            <img ng-src="{{trek.properties.pictures[0].url}}" ng-alt="{{trek.properties.pictures[0].title}}">    \n        </div>\n        <h1 class="title">{{trek.properties.name}}</h1>\n        <div class="infos">\n            <span>{{trek.properties.districts[0].name}} - </span>\n            <span>{{trek.properties.duration_pretty}} - </span>\n            <span>Dénivelé {{trek.properties.ascent}} - </span>\n            <span>{{trek.properties.difficulty.label}} - </span>\n            <span>{{trek.properties.usages[0].label}}</span>\n        </div>\n        <ul class="themes">\n            <li ng-repeat="theme in trek.properties.themes">\n                <img ng-src="{{theme.pictogram}}" ng-alt="{{theme.label}}">\n            </li>\n        </ul>\n        <div class="know-more">\n            <span>+</span>\n        </div>\n\n    </article>\n</section>';
},{}]},{},["./src/app/app.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2FwcC5qcyIsInNyYy9hcHAvY29uZmlnL2ZhY3Rvcmllcy5qcyIsInNyYy9hcHAvY29uZmlnL2luZGV4LmpzIiwic3JjL2FwcC9maWx0ZXJzL2luZGV4LmpzIiwic3JjL2FwcC9maWx0ZXJzL3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL2xheW91dC9pbmRleC5qcyIsInNyYy9hcHAvbGF5b3V0L3JvdXRlcy5qcyIsInNyYy9hcHAvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2Zvb3Rlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2xheW91dC5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL3NpZGViYXIuaHRtbCIsInNyYy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInNyYy9hcHAvbWFwL2luZGV4LmpzIiwic3JjL2FwcC9tYXAvc2VydmljZXMuanMiLCJzcmMvYXBwL21hcC90ZW1wbGF0ZXMvbWFwLmh0bWwiLCJzcmMvYXBwL3RyZWtzL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC90cmVrcy9kaXJlY3RpdmVzLmpzIiwic3JjL2FwcC90cmVrcy9pbmRleC5qcyIsInNyYy9hcHAvdHJla3Mvc2VydmljZXMuanMiLCJzcmMvYXBwL3RyZWtzL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9RQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL01BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlcGVuZGVuY2llcyA9IFtcbiAgICAvLyBPdXIgc3VibW9kdWxlc1xuICAgICdyYW5kby5jb25maWcnLCAncmFuZG8udHJla3MnLCAncmFuZG8ubGF5b3V0JywgJ3JhbmRvLm1hcCcsICdyYW5kby5maWx0ZXJzJyxcblxuICAgIC8vIEV4dGVybmFsIHN0dWZmXG4gICAgJ3VpLnJvdXRlcicsICduZ1Jlc291cmNlJ1xuXTtcblxuYW5ndWxhci5tb2R1bGUoJ2dlb3RyZWtSYW5kbycsIGRlcGVuZGVuY2llcyk7XG5cbi8vIFJlcXVpcmUgR2VvdHJlayBjb21wb25lbnRzXG5yZXF1aXJlKCcuL2NvbmZpZycpO1xuLy9yZXF1aXJlKCcuL2NvbW1vbnMnKTtcbnJlcXVpcmUoJy4vbGF5b3V0Jyk7XG5yZXF1aXJlKCcuL3RyZWtzJyk7XG5yZXF1aXJlKCcuL21hcCcpO1xucmVxdWlyZSgnLi9maWx0ZXJzJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHNldHRpbmdzRmFjdG9yeShnbG9iYWxTZXR0aW5ncykge1xuXG4gICAgLy8gQ09OU1RBTlRTIFZBUiB0aGF0IHVzZXIgY2FuIGNoYW5nZVxuICAgIC8vXG4gICAgdmFyIERPTUFJTiA9ICdodHRwOi8vMTkyLjE2OC4xMDAuNDQ6ODg4OCcsXG5cbiAgICAgICAgLy9QQVRIUyBBTkQgRElSRUNUT1JZXG4gICAgICAgIEZJTEVTX0RJUiA9ICdmaWxlcy9hcGknLFxuICAgICAgICBUUkVLX0RJUiA9ICd0cmVrJyxcbiAgICAgICAgVElMRVNfRElSID0gJ3RpbGVzJyxcblxuICAgICAgICBUUkVLU19GSUxFID0gJ3RyZWsuZ2VvanNvbicsXG4gICAgICAgIC8vUE9JX0ZJTEUgPSAncG9pcy5nZW9qc29uJyxcblxuICAgICAgICBMRUFGTEVUX0JBQ0tHUk9VTkRfVVJMID0gJ2h0dHA6Ly97c30udGlsZS5vcGVuc3RyZWV0bWFwLm9yZy97en0ve3h9L3t5fS5wbmcnLFxuXG4gICAgICAgIExFQUZMRVRfQ09ORiA9IHtcbiAgICAgICAgICAgIENFTlRFUl9MQVRJVFVERTogNDQuODMsXG4gICAgICAgICAgICBDRU5URVJfTE9OR0lUVURFOiA2LjM0LFxuICAgICAgICAgICAgREVGQVVMVF9aT09NOiAxMixcbiAgICAgICAgICAgIERFRkFVTFRfTUlOX1pPT006IDgsXG4gICAgICAgICAgICBERUZBVUxUX01BWF9aT09NOiAxNixcbiAgICAgICAgICAgIEFUVFJJQlVUSU9OOiAnKGMpIElHTiBHZW9wb3J0YWlsJyxcbiAgICAgICAgICAgIFRSRUtfQ09MT1I6ICcjRjg5NDA2J1xuICAgICAgICB9O1xuXG4gICAgLy8gUFJJVkFURSBWQVJcbiAgICAvL1xuICAgIHZhciBfYWN0aXZlTGFuZyA9IGdsb2JhbFNldHRpbmdzLkRFRkFVTFRfTEFOR1VBR0U7XG5cblxuICAgIC8vIFBVQkxJQyBWQVJcbiAgICAvL1xuICAgIHZhciB0cmVrc1VybCA9ICBET01BSU4gKyAnLycgKyBGSUxFU19ESVIgKyAnLycgKyBUUkVLX0RJUiArICcvJyArIFRSRUtTX0ZJTEUsXG4gICAgICAgIGZpbHRlcnMgPSB7XG4gICAgICAgICAgICBkdXJhdGlvbnMgOiBbXG4gICAgICAgICAgICAgICAgeyBpZDogNCwgbmFtZTogJzwxLzIgSicsIGludGVydmFsOiBbMCwgNF19LFxuICAgICAgICAgICAgICAgIHsgaWQ6IDEwLCBuYW1lOiAnMS8yIC0gMScsIGludGVydmFsOiBbNCwgMTBdIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogMjQsIG5hbWU6ICc+IDEgSicsIGludGVydmFsOiBbMTAsIDk5OTk5XX1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBlbGV2YXRpb25zIDogIFtcbiAgICAgICAgICAgICAgICB7IGlkOiAwLCBuYW1lOiAnPDMwMG0nLCBpbnRlcnZhbDogWzAsIDMwMF0gfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAzMDAsIG5hbWU6ICczMDAtNjAwJywgaW50ZXJ2YWw6IFszMDEsIDYwMF0gfSxcbiAgICAgICAgICAgICAgICB7IGlkOiA2MDAsIG5hbWU6ICc2MDAtMTAwMCcsIGludGVydmFsOiBbNjAxLCAxMDAwXSB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6IDEwMDAsIG5hbWU6ICc+MTAwMG0nLCBpbnRlcnZhbDogWzEwMDEsIDk5OTk5XSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAvL1BVQkxJQyBNRVRIT0RTXG4gICAgLy9cbiAgICB2YXIgc2V0TGFuZyA9IGZ1bmN0aW9uIChuZXdMYW5nKSB7XG4gICAgICAgIF9hY3RpdmVMYW5nID0gbmV3TGFuZztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhciBnZXRMYW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX2FjdGl2ZUxhbmc7XG4gICAgfTtcblxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvL0NPTlNUQU5UU1xuICAgICAgICBET01BSU46IERPTUFJTixcbiAgICAgICAgTEVBRkxFVF9CQUNLR1JPVU5EX1VSTDogTEVBRkxFVF9CQUNLR1JPVU5EX1VSTCxcbiAgICAgICAgTEVBRkxFVF9DT05GOiBMRUFGTEVUX0NPTkYsXG5cbiAgICAgICAgLy9QVUJMSUMgVkFSXG4gICAgICAgIHRyZWtzVXJsOiB0cmVrc1VybCxcbiAgICAgICAgZmlsdGVyczogZmlsdGVycyxcblxuICAgICAgICAvL01FVEhPRFNcbiAgICAgICAgc2V0TGFuZzogc2V0TGFuZyxcbiAgICAgICAgZ2V0TGFuZzogZ2V0TGFuZ1xuXG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBzZXR0aW5nc0ZhY3Rvcnk6IHNldHRpbmdzRmFjdG9yeVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby5jb25maWcnLCBbXSlcbiAgICAuY29uc3RhbnQoJ2dsb2JhbFNldHRpbmdzJywge1xuICAgICAgICBERUZBVUxUX0xBTkdVQUdFOiAnZnInXG4gICAgfSlcbiAgICAuZmFjdG9yeSgnc2V0dGluZ3NGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMnKS5zZXR0aW5nc0ZhY3RvcnkpOyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLmZpbHRlcnMnLCBbXSlcbiAgICAuc2VydmljZSgnZmlsdGVyc1NlcnZpY2UnLCByZXF1aXJlKCcuL3NlcnZpY2VzJykuZmlsdGVyc1NlcnZpY2UpOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZmlsdGVyc1NlcnZpY2UoJHEsICRzY2UsIHNldHRpbmdzRmFjdG9yeSkge1xuXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gR2V0IGRlZmF1bHQgdmFsdWUgZm9yIGVhY2ggZmlsdGVyIGZpZWxkXG4gICAgdGhpcy5nZXREZWZhdWx0QWN0aXZlRmlsdGVyVmFsdWVzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWZmaWN1bHR5OiAgIHt9LFxuICAgICAgICAgICAgZHVyYXRpb246ICAgICB7fSxcbiAgICAgICAgICAgIGVsZXZhdGlvbjogICAge30sXG4gICAgICAgICAgICBkb3dubG9hZDogICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRoZW1lOiAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgbXVuaWNpcGFsaXR5OiBudWxsLFxuICAgICAgICAgICAgdXNlOiAgICAgICAgICBudWxsLFxuICAgICAgICAgICAgdmFsbGV5OiAgICAgICBudWxsLFxuICAgICAgICAgICAgcm91dGU6ICAgICAgICBudWxsLFxuICAgICAgICAgICAgc2VhcmNoOiAgICAgICAnJ1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaXNWYWxpZEZpbHRlciA9IGZ1bmN0aW9uKHZhbHVlLCBmaWx0ZXIpIHtcbiAgICAgICAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNVbmRlZmluZWQodmFsdWUpXG4gICAgICAgICAgICB8fCBhbmd1bGFyLmlzVW5kZWZpbmVkKGZpbHRlcilcbiAgICAgICAgICAgIHx8IChmaWx0ZXIgPT09IG51bGwpXG4gICAgICAgICAgICB8fCAodmFsdWUgPT09IG51bGwpXG4gICAgICAgICAgICB8fCAoYW5ndWxhci5lcXVhbHMoZmlsdGVyLCB7fSkpKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHZhbGlkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWxpZDtcbiAgICB9O1xuXG4gICAgLy8gR2VuZXJpYyBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbiBoYXJkY29kZWQgZmlsdGVyc1xuICAgIHRoaXMuZmlsdGVyVHJla1dpdGhGaWx0ZXIgPSBmdW5jdGlvbih0cmVrVmFsdWUsIGZpbHRlcikge1xuXG4gICAgICAgIC8vIFRyZWsgY29uc2lkZXJlZCBhcyBtYXRjaGluZyBpZiBmaWx0ZXIgbm90IHNldCBvciBpZlxuICAgICAgICAvLyBwcm9wZXJ0eSBpcyBlbXB0eS5cbiAgICAgICAgdmFyIGlzX3ZhbGlkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkRmlsdGVyKHRyZWtWYWx1ZSwgZmlsdGVyKSkge1xuICAgICAgICAgICAgaWYoYW5ndWxhci5pc051bWJlcihmaWx0ZXIpKXtcbiAgICAgICAgICAgICAgICBpc192YWxpZCA9IHRyZWtWYWx1ZSA8PSBmaWx0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZmlsdGVyKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbHRlcltrZXlzW2ldXSA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSW4gY29tYmluZWQgZmlsdGVycyBpZiBvbmUgZmlsdGVyIGlzIHZhbGlkLCBubyBuZWVkIHRvIGxvb2sgb24gdGhlIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPUiBvcGVyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyZWtWYWx1ZSA8PSBwYXJzZUZsb2F0KGtleXNbaV0pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzX3ZhbGlkO1xuICAgIH07XG5cbiAgICAvLyBHZW5lcmljIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIG9uIGhhcmRjb2RlZCByYW5nZSBmaWx0ZXJzXG4gICAgdGhpcy5maWx0ZXJUcmVrV2l0aEludGVydmFsID0gZnVuY3Rpb24odHJla1ZhbHVlLCBmaWx0ZXJzKSB7XG4gICAgICAgIHZhciBpc192YWxpZCA9IHRydWU7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZmlsdGVycyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGZpbHRlciA9IGZpbHRlcnNba2V5c1tpXV07XG4gICAgICAgICAgICBpZiAoZmlsdGVyLmNoZWNrZWQgPT09IHRydWUgKXtcbiAgICAgICAgICAgICAgICAvLyBJbiBjb21iaW5lZCBmaWx0ZXJzIGlmIG9uZSBmaWx0ZXIgaXMgdmFsaWQsIG5vIG5lZWQgdG8gbG9vayBvbiB0aGUgb3RoZXJcbiAgICAgICAgICAgICAgICAvLyBPUiBvcGVyYXRvclxuICAgICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KHRyZWtWYWx1ZSkgPj0gcGFyc2VGbG9hdChmaWx0ZXIuaW50ZXJ2YWxbMF0pICYmIHBhcnNlRmxvYXQodHJla1ZhbHVlKSA8PSBwYXJzZUZsb2F0KGZpbHRlci5pbnRlcnZhbFsxXSkpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgaXNfdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBpc192YWxpZDtcbiAgICB9O1xuXG4gICAgLy8gR2VuZXJpYyBmdW5jdGlvbiB0aGF0IGlzIGNhbGxlZCBvbiBoYXJkY29kZWQgZmlsdGVyc1xuICAgIHRoaXMuZmlsdGVyVHJla0VxdWFscyA9IGZ1bmN0aW9uKHRyZWtWYWx1ZSwgZmlsdGVyKSB7XG5cbiAgICAgICAgdmFyIGlzX3ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaXNWYWxpZEZpbHRlcih0cmVrVmFsdWUsIGZpbHRlcikpIHtcbiAgICAgICAgICAgIGlmKGFuZ3VsYXIuaXNOdW1iZXIoZmlsdGVyKSl7XG4gICAgICAgICAgICAgICAgaXNfdmFsaWQgPSB0cmVrVmFsdWUgPT09IGZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmaWx0ZXIpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyW2tleXNbaV1dID09PSB0cnVlICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBjb21iaW5lZCBmaWx0ZXJzIGlmIG9uZSBmaWx0ZXIgaXMgdmFsaWQsIG5vIG5lZWQgdG8gbG9vayBvbiB0aGUgb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9SIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGFyc2VGbG9hdCh0cmVrVmFsdWUpID09PSBwYXJzZUZsb2F0KGtleXNbaV0pKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNfdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzX3ZhbGlkO1xuICAgIH07XG5cbiAgICAvLyBHZW5lcmljIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIG9uIHNlbGVjdCBmaWx0ZXJzXG4gICAgdGhpcy5maWx0ZXJUcmVrV2l0aFNlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdE9wdGlvblZhbHVlcywgZm9ybVZhbHVlLCBmaWVsZFRvQ2hlY2spIHtcbiAgICAgICAgLy8gVHJlayBjb25zaWRlcmVkIGFzIG1hdGNoaW5nIGlmIGZpbHRlciBub3Qgc2V0IG9yIGlmXG4gICAgICAgIC8vIHByb3BlcnR5IGlzIGVtcHR5LlxuICAgICAgICBpZiAoISh0aGlzLmlzVmFsaWRGaWx0ZXIoc2VsZWN0T3B0aW9uVmFsdWVzLCBmb3JtVmFsdWUpKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShzZWxlY3RPcHRpb25WYWx1ZXMpKSB7XG4gICAgICAgICAgICBzZWxlY3RPcHRpb25WYWx1ZXMgPSBbc2VsZWN0T3B0aW9uVmFsdWVzXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzaW5nIG5hdGl2ZSBsb29wcyBpbnN0ZWFkIG9mIGFuZ3VsYXJqcyBmb3JFYWNoIGJlY2F1c2Ugd2Ugd2FudCB0byBzdG9wIHNlYXJjaGluZ1xuICAgICAgICAvLyB3aGVuIHZhbHVlIGhhcyBiZWVuIGZvdW5kXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxlY3RPcHRpb25WYWx1ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBmaWVsZFZhbHVlID0gc2VsZWN0T3B0aW9uVmFsdWVzW2ldW2ZpZWxkVG9DaGVja107XG4gICAgICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZChmaWVsZFZhbHVlKSB8fCAoZmllbGRWYWx1ZSA9PT0gZm9ybVZhbHVlLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgLy8gRnVuY3Rpb24gY2FsbGVkIGVhY2ggdGltZSBhIGZpbHRlciBpcyBtb2RpZmllZCwgdG8ga25vdyB3aGljaCB0cmVrcyB0byBkaXNwbGF5XG4gICAgdGhpcy5maWx0ZXJUcmVrcyA9IGZ1bmN0aW9uKHRyZWtzLCBhY3RpdmVGaWx0ZXJzKSB7XG4gICAgICAgIHZhciBmaWx0ZXJlZFRyZWtzID0gW107XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrcywgZnVuY3Rpb24odHJlaykge1xuICAgICAgICAgICAgaWYgKHNlbGYuZmlsdGVyVHJla0VxdWFscyh0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5pZCwgYWN0aXZlRmlsdGVycy5kaWZmaWN1bHR5KSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrV2l0aEludGVydmFsKHRyZWsucHJvcGVydGllcy5kdXJhdGlvbiwgYWN0aXZlRmlsdGVycy5kdXJhdGlvbikgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhJbnRlcnZhbCh0cmVrLnByb3BlcnRpZXMuYXNjZW50LCBhY3RpdmVGaWx0ZXJzLmVsZXZhdGlvbikgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla0VxdWFscygodHJlay50aWxlcyAmJiB0cmVrLnRpbGVzLmlzRG93bmxvYWRlZCkgPyAxIDogMCwgYWN0aXZlRmlsdGVycy5kb3dubG9hZCkgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhTZWxlY3QodHJlay5wcm9wZXJ0aWVzLnRoZW1lcywgYWN0aXZlRmlsdGVycy50aGVtZSwgJ2lkJykgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhTZWxlY3QodHJlay5wcm9wZXJ0aWVzLnVzYWdlcywgYWN0aXZlRmlsdGVycy51c2UsICdpZCcpICYmXG4gICAgICAgICAgICBzZWxmLmZpbHRlclRyZWtXaXRoU2VsZWN0KHRyZWsucHJvcGVydGllcy5yb3V0ZSwgYWN0aXZlRmlsdGVycy5yb3V0ZSwgJ2lkJykgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhTZWxlY3QodHJlay5wcm9wZXJ0aWVzLmRpc3RyaWN0cywgYWN0aXZlRmlsdGVycy52YWxsZXksICdpZCcpICYmXG4gICAgICAgICAgICBzZWxmLmZpbHRlclRyZWtXaXRoU2VsZWN0KHRyZWsucHJvcGVydGllcy5jaXRpZXMsIGFjdGl2ZUZpbHRlcnMubXVuaWNpcGFsaXR5LCAnY29kZScpKSB7XG4gICAgICAgICAgICAgICAgZmlsdGVyZWRUcmVrcy5wdXNoKHRyZWspO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZFRyZWtzO1xuICAgIH07XG5cblxuICAgIC8vIFJlbW92ZSBmaWx0ZXIgZHVwbGljYXRlcyB0aGF0IGhhdmUgdGhlIHNhbWUgXCJ2YWx1ZVwiXG4gICAgdGhpcy5yZW1vdmVGaWx0ZXJEdXBsaWNhdGVzID0gZnVuY3Rpb24oYXJyYXkpIHtcblxuICAgICAgICB2YXIgZGljdCA9IHt9LCByZXN1bHQ9W107XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRWYWx1ZSA9IGFycmF5W2ldLnZhbHVlO1xuICAgICAgICAgICAgZGljdFtjdXJyZW50VmFsdWVdID0gYXJyYXlbaV07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRpY3RLZXlzID0gT2JqZWN0LmtleXMoZGljdCk7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxkaWN0S2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goZGljdFtkaWN0S2V5c1tpXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuXG4gICAgLy8gU29ydCBmaWx0ZXIgdmFsdWVzIGJ5IHRoZWlyIG5hbWVcbiAgICB0aGlzLnNvcnRGaWx0ZXJOYW1lcyA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgICAgIGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgdmFyIG5hbWVBID0gYS5uYW1lO1xuICAgICAgICAgICAgdmFyIG5hbWVCID0gYi5uYW1lO1xuICAgICAgICAgICAgcmV0dXJuIChuYW1lQSA8IG5hbWVCKSA/IC0xIDogKG5hbWVBID4gbmFtZUIpID8gMSA6IDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgLy8gU29ydCBmaWx0ZXIgdmFsdWVzIGJ5IHRoZWlyIHZhbHVlXG4gICAgdGhpcy5zb3J0RmlsdGVyVmFsdWVzID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgICAgYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWVBID0gYS52YWx1ZTtcbiAgICAgICAgICAgIHZhciB2YWx1ZUIgPSBiLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuICh2YWx1ZUEgPCB2YWx1ZUIpID8gLTEgOiAodmFsdWVBID4gdmFsdWVCKSA/IDEgOiAwO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgfTtcblxuICAgIC8vIFBvc3NpYmxlIHZhbHVlcyB0aGF0IHVzZXIgY2FuIHNlbGVjdCBvbiBmaWx0ZXIgc2lkZWJhciBtZW51LlxuICAgIC8vIFNvbWUgYXJlIGNvbnN0YW50cyBkZWZpbmVkIGluIHNldHRpbmdzIChkdXJhdGlvbnMsIGVsZXZhdGlvbnMpLFxuICAgIC8vIG90aGVycyBjb21lIGZyb20gdHJlayBwb3NzaWJsZSB2YWx1ZXNcbiAgICB0aGlzLmdldFRyZWtGaWx0ZXJPcHRpb25zID0gZnVuY3Rpb24odHJla3MpIHtcblxuICAgICAgICB2YXIgdHJla1RoZW1lcyA9IFtdLFxuICAgICAgICAgICAgdHJla1VzZXMgPSBbXSxcbiAgICAgICAgICAgIHRyZWtSb3V0ZSA9IFtdLFxuICAgICAgICAgICAgdHJla1ZhbGxleXMgPSBbXSxcbiAgICAgICAgICAgIHRyZWtNdW5pY2lwYWxpdGllcyA9IFtdLFxuICAgICAgICAgICAgdHJla0RpZmZpY3VsdGllcyA9IFtdO1xuXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrcy5mZWF0dXJlcywgZnVuY3Rpb24odHJlaykge1xuXG4gICAgICAgICAgICAvLyBUaGVtZXMgaW5pdFxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy50aGVtZXMsIGZ1bmN0aW9uKHRoZW1lKSB7XG4gICAgICAgICAgICAgICAgdHJla1RoZW1lcy5wdXNoKHt2YWx1ZTogdGhlbWUuaWQsIG5hbWU6IHRoZW1lLmxhYmVsfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGlmZnVsdGllcyBpbml0XG4gICAgICAgICAgICB2YXIgZGlmZmljdWx0eSA9IHRyZWsucHJvcGVydGllcy5kaWZmaWN1bHR5O1xuICAgICAgICAgICAgdHJla0RpZmZpY3VsdGllcy5wdXNoKHt2YWx1ZTogZGlmZmljdWx0eS5pZCwgbmFtZTogZGlmZmljdWx0eS5sYWJlbCwgaWNvbjogJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoZGlmZmljdWx0eS5waWN0b2dyYW0pfSk7XG5cbiAgICAgICAgICAgIC8vIFVzZXMgaW5pdFxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy51c2FnZXMsIGZ1bmN0aW9uKHVzYWdlKSB7XG4gICAgICAgICAgICAgICAgdHJla1VzZXMucHVzaCh7dmFsdWU6IHVzYWdlLmlkLCBuYW1lOiB1c2FnZS5sYWJlbH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIFJvdXRlIGluaXRcbiAgICAgICAgICAgIHZhciByb3V0ZSA9IHRyZWsucHJvcGVydGllcy5yb3V0ZTtcbiAgICAgICAgICAgIHRyZWtSb3V0ZS5wdXNoKHt2YWx1ZTogcm91dGUuaWQsIG5hbWU6IHJvdXRlLmxhYmVsfSk7XG5cbiAgICAgICAgICAgIC8vIFZhbGxleXMgaW5pdFxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5kaXN0cmljdHMsIGZ1bmN0aW9uKGRpc3RyaWN0KSB7XG4gICAgICAgICAgICAgICAgdHJla1ZhbGxleXMucHVzaCh7dmFsdWU6IGRpc3RyaWN0LmlkLCBuYW1lOiBkaXN0cmljdC5uYW1lfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTXVuaWNpcGFsaXRpZXMgaW5pdFxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5jaXRpZXMsIGZ1bmN0aW9uKGNpdHkpIHtcbiAgICAgICAgICAgICAgICB0cmVrTXVuaWNpcGFsaXRpZXMucHVzaCh7dmFsdWU6IGNpdHkuY29kZSwgbmFtZTogY2l0eS5uYW1lfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gUmVtb3ZpbmcgcG9zc2libGUgdmFsdWVzIGR1cGxpY2F0ZXNcbiAgICAgICAgdHJla1RoZW1lcyA9IHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrVGhlbWVzKTtcbiAgICAgICAgdHJla1VzZXMgPSB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXModHJla1VzZXMpO1xuICAgICAgICB0cmVrUm91dGUgPSB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXModHJla1JvdXRlKTtcbiAgICAgICAgdHJla1ZhbGxleXMgPSB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXModHJla1ZhbGxleXMpO1xuICAgICAgICB0cmVrTXVuaWNpcGFsaXRpZXMgPSB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXModHJla011bmljaXBhbGl0aWVzKTtcbiAgICAgICAgdHJla0RpZmZpY3VsdGllcyA9ICB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXModHJla0RpZmZpY3VsdGllcyk7XG5cbiAgICAgICAgLy8gU29ydCB2YWx1ZXMgYnkgdGhlaXIgbmFtZVxuICAgICAgICB0cmVrVGhlbWVzID0gdGhpcy5zb3J0RmlsdGVyTmFtZXModHJla1RoZW1lcyk7XG4gICAgICAgIHRyZWtVc2VzID0gdGhpcy5zb3J0RmlsdGVyTmFtZXModHJla1VzZXMpO1xuICAgICAgICB0cmVrUm91dGUgPSB0aGlzLnNvcnRGaWx0ZXJOYW1lcyh0cmVrUm91dGUpO1xuICAgICAgICB0cmVrVmFsbGV5cyA9IHRoaXMuc29ydEZpbHRlck5hbWVzKHRyZWtWYWxsZXlzKTtcbiAgICAgICAgdHJla011bmljaXBhbGl0aWVzID0gdGhpcy5zb3J0RmlsdGVyTmFtZXModHJla011bmljaXBhbGl0aWVzKTtcbiAgICAgICAgdHJla0RpZmZpY3VsdGllcyA9IHRoaXMuc29ydEZpbHRlclZhbHVlcyh0cmVrRGlmZmljdWx0aWVzKTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGlmZmljdWx0aWVzIDogdHJla0RpZmZpY3VsdGllcyxcbiAgICAgICAgICAgIGR1cmF0aW9ucyA6IHNldHRpbmdzRmFjdG9yeS5maWx0ZXJzLmR1cmF0aW9ucyxcbiAgICAgICAgICAgIGVsZXZhdGlvbnMgOiAgc2V0dGluZ3NGYWN0b3J5LmZpbHRlcnMuZWxldmF0aW9ucyxcbiAgICAgICAgICAgIGRvd25sb2FkcyA6IFtcbiAgICAgICAgICAgICAgICB7IHZhbHVlOiAxLCBuYW1lOiAnbmF2X3RyZWtfbWFwLm9mZmxpbmUnLCBpY29uOiAnaWNvbl9vZmZsaW5lLnN2ZycgfVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIHRoZW1lcyA6IHRyZWtUaGVtZXMsXG4gICAgICAgICAgICB1c2VzOiB0cmVrVXNlcyxcbiAgICAgICAgICAgIHJvdXRlczogdHJla1JvdXRlLFxuICAgICAgICAgICAgdmFsbGV5czogdHJla1ZhbGxleXMsXG4gICAgICAgICAgICBtdW5pY2lwYWxpdGllczogdHJla011bmljaXBhbGl0aWVzXG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBmaWx0ZXJzU2VydmljZSA6IGZpbHRlcnNTZXJ2aWNlXG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBMYXlvdXRDb250cm9sbGVyKCkge1xuXG59XG5cbmZ1bmN0aW9uIEhlYWRlckNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIFNpZGViYXJDb250cm9sbGVyKCkge1xufVxuXG5mdW5jdGlvbiBGb290ZXJDb250cm9sbGVyKCkge1xufVxuXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIExheW91dENvbnRyb2xsZXI6IExheW91dENvbnRyb2xsZXIsXG4gICAgSGVhZGVyQ29udHJvbGxlcjogSGVhZGVyQ29udHJvbGxlcixcbiAgICBTaWRlYmFyQ29udHJvbGxlcjogU2lkZWJhckNvbnRyb2xsZXIsXG4gICAgRm9vdGVyQ29udHJvbGxlcjogRm9vdGVyQ29udHJvbGxlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdyYW5kby5sYXlvdXQnLCBbJ3VpLnJvdXRlcicsICdyYW5kby50cmVrcyddKVxuICAgIC5jb25maWcocmVxdWlyZSgnLi9yb3V0ZXMnKS5sYXlvdXRSb3V0ZXMpXG4gICAgLnJ1bihyZXF1aXJlKCcuL3NlcnZpY2VzJykuUnVuQXBwKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjb250cm9sbGVyID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBsYXlvdXRSb3V0ZXMoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuXG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdsYXlvdXQnLCB7XG4gICAgICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9sYXlvdXQuaHRtbCcpLFxuICAgICAgICAgICAgY29udHJvbGxlcjogY29udHJvbGxlci5MYXlvdXRDb250cm9sbGVyXG4gICAgICAgIH0pXG4gICAgICAgIC5zdGF0ZSgncm9vdCcsIHtcbiAgICAgICAgICAgIHBhcmVudDogJ2xheW91dCcsXG4gICAgICAgICAgICB1cmw6ICcvJyxcbiAgICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICAgJ2hlYWRlcicgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9oZWFkZXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkhlYWRlckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdzaWRlYmFyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL3NpZGViYXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLlNpZGViYXJDb250cm9sbGVyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnY29udGVudCcgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9jb250ZW50LWhvbWUuaHRtbCcpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2Zvb3RlcicgOiB7XG4gICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy9mb290ZXIuaHRtbCcpLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkZvb3RlckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsYXlvdXRSb3V0ZXM6IGxheW91dFJvdXRlc1xufTsiLCIndXNlIHN0cmljdCc7XG5cblxuZnVuY3Rpb24gUnVuQXBwKCkge1xuICAgIGNvbnNvbGUubG9nKCdhcHAgc3RhcnRlZCcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBSdW5BcHA6IFJ1bkFwcFxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwicmVzdWx0cy1kcmF3ZXJcIj5cXG4gICAgPHRyZWtzLWxpc3RlPjwvdHJla3MtbGlzdGU+ICAgIFxcbjwvZGl2PlxcbjxnZW90cmVrLW1hcD48L2dlb3RyZWstbWFwPic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPlxcblxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiIHJvbGU9XCJuYXZpZ2F0aW9uXCI+XFxuICAgIDxkaXYgaWQ9XCJsb2dvXCI+TG9nbzwvZGl2PlxcbjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBpZD1cImhlYWRlclwiIHVpLXZpZXc9XCJoZWFkZXJcIj48L2Rpdj5cXG48ZGl2IGlkPVwibWFpbi1jb250ZW50XCIgY2xhc3M9XCJmbHVpZC1jb3RhaW5lclwiPlxcbiAgICA8ZGl2IGNsYXNzPVwicm93XCI+XFxuICAgICAgICA8ZGl2IGlkPVwic2lkZWJhclwiIHVpLXZpZXc9XCJzaWRlYmFyXCIgY2xhc3M9XCJjb2wtc20tMVwiPjwvZGl2PlxcbiAgICAgICAgPGRpdiB1aS12aWV3PVwiY29udGVudFwiIGNsYXNzPVwiY29sLXNtLTExIGNvbnRlbnRcIj48L2Rpdj5cXG4gICAgPC9kaXY+XFxuPC9kaXY+XFxuPGRpdiBpZD1cImZvb3RlclwiIHVpLXZpZXc9XCJmb290ZXJcIj48L2Rpdj4nOyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXY+XFxuPC9kaXY+JzsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIE1hcENvbnRyb2xsZXIoJHNjb3BlLCBzZXR0aW5nc0ZhY3RvcnksIG1hcFNlcnZpY2UsIGljb25zU2VydmljZSwgdHJla3NTZXJ2aWNlKSB7XG4gICAgXG4gICAgdmFyIG1hcCwgdHJla3NMYXllcjtcblxuICAgIGZ1bmN0aW9uIHVwZGF0ZVRyZWtzKGNhbGxiYWNrKSB7XG4gICAgICAgIHRyZWtzU2VydmljZS5nZXRUcmVrcygpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmVrcyA9IGRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHR5cGVvZiBjYWxsYmFja1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFja1swXShjYWxsYmFja1sxXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hcEluaXQocGFyYW1ldGVycykge1xuICAgICAgICB2YXIgbWFwUGFyYW1ldGVycyA9IG1hcFNlcnZpY2UuZ2V0TWFwSW5pdFBhcmFtZXRlcnMoKSxcbiAgICAgICAgICAgIG1hcFNlbGVjdG9yID0gcGFyYW1ldGVyc1swXSB8fCAnbWFwJztcblxuICAgICAgICBtYXAgPSBMLm1hcChtYXBTZWxlY3RvciwgbWFwUGFyYW1ldGVycyk7XG5cbiAgICAgICAgdHJla3NMYXllciA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCh7XG4gICAgICAgICAgICBzaG93Q292ZXJhZ2VPbkhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIGljb25DcmVhdGVGdW5jdGlvbjogZnVuY3Rpb24oY2x1c3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBpY29uc1NlcnZpY2UuZ2V0Q2x1c3Rlckljb24oY2x1c3Rlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUudHJla3NMYXllciA9IHRyZWtzTGF5ZXI7XG5cbiAgICAgICAgLy8gU2hvdyB0aGUgc2NhbGUgYW5kIGF0dHJpYnV0aW9uIGNvbnRyb2xzXG4gICAgICAgIG1hcFNlcnZpY2Uuc2V0U2NhbGUobWFwKTtcbiAgICAgICAgbWFwU2VydmljZS5zZXRBdHRyaWJ1dGlvbihtYXApO1xuICAgICAgICBzaG93VHJla3MoKTtcblxuICAgIH1cblxuICAgICAvLyBBZGQgdHJla3MgZ2VvanNvbiB0byB0aGUgbWFwXG4gICAgZnVuY3Rpb24gc2hvd1RyZWtzKCkge1xuICAgICAgICAvLyBSZW1vdmUgYWxsIG1hcmtlcnMgc28gdGhlIGRpc3BsYXllZCBtYXJrZXJzIGNhbiBmaXQgdGhlIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIHRyZWtzTGF5ZXIuY2xlYXJMYXllcnMoKTtcblxuICAgICAgICAvLyRzY29wZS5tYXBTZXJ2aWNlID0gbWFwU2VydmljZTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS50cmVrcy5mZWF0dXJlcy8qZmlsdGVyRmlsdGVyKCRyb290U2NvcGUuZmlsdGVyZWRUcmVrcywgJHNjb3BlLmFjdGl2ZUZpbHRlcnMuc2VhcmNoKSovLCBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgICAgICB2YXIgdHJla0RlcGFydHVyZSA9IG1hcFNlcnZpY2UuY3JlYXRlQ2x1c3Rlck1hcmtlckZyb21UcmVrKHRyZWspO1xuICAgICAgICAgICAgdHJla0RlcGFydHVyZS5vbih7XG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21hcmtlciBDbGlja2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJHN0YXRlLmdvKFwiaG9tZS5tYXAuZGV0YWlsXCIsIHsgdHJla0lkOiB0cmVrLmlkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJla3NMYXllci5hZGRMYXllcih0cmVrRGVwYXJ0dXJlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG1hcC5hZGRMYXllcih0cmVrc0xheWVyKTtcblxuICAgICAgICAvKmlmICgodXBkYXRlQm91bmRzID09IHVuZGVmaW5lZCkgfHwgKHVwZGF0ZUJvdW5kcyA9PSB0cnVlKSkgeyAgICBcbiAgICAgICAgICAgIG1hcC5maXRCb3VuZHModHJla3NMYXllci5nZXRCb3VuZHMoKSk7XG4gICAgICAgIH0qL1xuICAgIH07XG5cbiAgICB1cGRhdGVUcmVrcyhbbWFwSW5pdCxbJ21hcCddXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE1hcENvbnRyb2xsZXIgOiBNYXBDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBtYXBEaXJlY3RpdmUoKSB7XG4gICAgY29uc29sZS5sb2coJ21hcCBsb2FkaW5nJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL21hcC5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLk1hcENvbnRyb2xsZXJcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYXBEaXJlY3RpdmU6IG1hcERpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLm1hcCcsIFtdKVxuICAgIC5zZXJ2aWNlKCdtYXBTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcycpLm1hcFNlcnZpY2UpXG4gICAgLnNlcnZpY2UoJ2ljb25zU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5pY29uc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJykuTWFwQ29udHJvbGxlcilcbiAgICAuZGlyZWN0aXZlKCdnZW90cmVrTWFwJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzJykubWFwRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG1hcFNlcnZpY2UoJHEsIHNldHRpbmdzRmFjdG9yeSwgdHJla3NTZXJ2aWNlLCBpY29uc1NlcnZpY2UpIHtcblxuICAgIHZhciBfbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy5nZXRNYXJrZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBfbWFya2VycztcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRNYXJrZXJzID0gZnVuY3Rpb24obWFya2Vycykge1xuICAgICAgICBfbWFya2VycyA9IG1hcmtlcnM7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0TWFwSW5pdFBhcmFtZXRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gU2V0IGRlZmF1bHQgTGVhZmxldCBtYXAgcGFyYW1zXG5cbiAgICAgICAgdmFyIG1hcF9wYXJhbWV0ZXJzID0ge1xuICAgICAgICAgICAgY2VudGVyOiBbc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5DRU5URVJfTEFUSVRVREUsIHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuQ0VOVEVSX0xPTkdJVFVERV0sXG4gICAgICAgICAgICB6b29tOiBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkRFRkFVTFRfWk9PTSxcbiAgICAgICAgICAgIG1pblpvb206IHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuREVGQVVMVF9NSU5fWk9PTSxcbiAgICAgICAgICAgIG1heFpvb206IHNldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuREVGQVVMVF9NQVhfWk9PTSxcbiAgICAgICAgICAgIHNjcm9sbFdoZWVsWm9vbTogdHJ1ZSxcbiAgICAgICAgICAgIHpvb21Db250cm9sOiBmYWxzZSxcbiAgICAgICAgICAgIGxheWVyczogTC50aWxlTGF5ZXIoc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQkFDS0dST1VORF9VUkwpXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIG1hcF9wYXJhbWV0ZXJzO1xuICAgIH07XG5cbiAgICB0aGlzLmNyZWF0ZU1hcmtlcnNGcm9tVHJlayA9IGZ1bmN0aW9uKHRyZWssIHBvaXMpIHtcbiAgICAgICAgdmFyIG1hcmtlcnMgPSBbXTtcblxuICAgICAgICB2YXIgc3RhcnRQb2ludCA9IHRyZWtzU2VydmljZS5nZXRTdGFydFBvaW50KHRyZWspO1xuICAgICAgICB2YXIgZW5kUG9pbnQgPSB0cmVrc1NlcnZpY2UuZ2V0RW5kUG9pbnQodHJlayk7XG4gICAgICAgIHZhciBwYXJraW5nUG9pbnQgPSB0cmVrc1NlcnZpY2UuZ2V0UGFya2luZ1BvaW50KHRyZWspO1xuXG4gICAgICAgIG1hcmtlcnMucHVzaChMLm1hcmtlcihbZW5kUG9pbnQubGF0LCBlbmRQb2ludC5sbmddLCB7XG4gICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0QXJyaXZhbEljb24oKSxcbiAgICAgICAgICAgIG5hbWU6IHRyZWsucHJvcGVydGllcy5hcnJpdmFsLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgbWFya2Vycy5wdXNoKEwubWFya2VyKFtzdGFydFBvaW50LmxhdCwgc3RhcnRQb2ludC5sbmddLCB7XG4gICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0RGVwYXJ0dXJlSWNvbigpLFxuICAgICAgICAgICAgbmFtZTogdHJlay5wcm9wZXJ0aWVzLmRlcGFydHVyZSxcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIGlmKHBhcmtpbmdQb2ludCkge1xuICAgICAgICAgICAgbWFya2Vycy5wdXNoKEwubWFya2VyKFtwYXJraW5nUG9pbnQubGF0LCBwYXJraW5nUG9pbnQubG5nXSwge1xuICAgICAgICAgICAgaWNvbjogaWNvbnNTZXJ2aWNlLmdldFBhcmtpbmdJY29uKCksXG4gICAgICAgICAgICBuYW1lOiBcIlBhcmtpbmdcIixcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0cmVrLnByb3BlcnRpZXMuYWR2aXNlZF9wYXJraW5nLFxuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpbmZvcm1hdGlvbkNvdW50ID0gMDtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5pbmZvcm1hdGlvbl9kZXNrcywgZnVuY3Rpb24oaW5mb3JtYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBpbmZvcm1hdGlvbkRlc2NyaXB0aW9uID0gXCI8cD5cIiArIGluZm9ybWF0aW9uLmRlc2NyaXB0aW9uICsgXCI8L3A+XCJcbiAgICAgICAgICAgICAgICArIFwiPHA+XCIgKyBpbmZvcm1hdGlvbi5zdHJlZXQgKyBcIjwvcD5cIlxuICAgICAgICAgICAgICAgICsgXCI8cD5cIiArIGluZm9ybWF0aW9uLnBvc3RhbF9jb2RlICsgXCIgXCIgKyBpbmZvcm1hdGlvbi5tdW5pY2lwYWxpdHkgKyBcIjwvcD5cIlxuICAgICAgICAgICAgICAgICsgXCI8cD48YSBocmVmPSdcIiArIGluZm9ybWF0aW9uLndlYnNpdGUgKyBcIic+V2ViPC9hPiAtIDxhIGhyZWY9J3RlbDpcIiArIGluZm9ybWF0aW9uLnBob25lICsgXCInPlwiICsgaW5mb3JtYXRpb24ucGhvbmUgKyBcIjwvYT48L3A+XCI7XG5cbiAgICAgICAgICAgIG1hcmtlcnMucHVzaChMLm1hcmtlcihbaW5mb3JtYXRpb24ubGF0aXR1ZGUsIGluZm9ybWF0aW9uLmxvbmdpdHVkZV0sIHtcbiAgICAgICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0SW5mb3JtYXRpb25JY29uKCksXG4gICAgICAgICAgICAgICAgbmFtZTogaW5mb3JtYXRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IGluZm9ybWF0aW9uLnBob3RvX3VybCxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaW5mb3JtYXRpb25EZXNjcmlwdGlvbixcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGluZm9ybWF0aW9uQ291bnQgKz0gMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHBvaXMsIGZ1bmN0aW9uKHBvaSkge1xuICAgICAgICAgICAgdmFyIHBvaUNvb3JkcyA9IHtcbiAgICAgICAgICAgICAgICAnbGF0JzogcG9pLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgICAgICdsbmcnOiBwb2kuZ2VvbWV0cnkuY29vcmRpbmF0ZXNbMF1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgcG9pSWNvbiA9IGljb25zU2VydmljZS5nZXRQT0lJY29uKHBvaSk7XG4gICAgICAgICAgICBtYXJrZXJzLnB1c2goTC5tYXJrZXIoW3BvaUNvb3Jkcy5sYXQsIHBvaUNvb3Jkcy5sbmddLCB7XG4gICAgICAgICAgICAgICAgaWNvbjogcG9pSWNvbixcbiAgICAgICAgICAgICAgICBuYW1lOiBwb2kucHJvcGVydGllcy5uYW1lLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBwb2kucHJvcGVydGllcy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IHBvaS5wcm9wZXJ0aWVzLnRodW1ibmFpbCxcbiAgICAgICAgICAgICAgICBpbWc6IHBvaS5wcm9wZXJ0aWVzLnBpY3R1cmVzWzBdLFxuICAgICAgICAgICAgICAgIHBpY3RvZ3JhbTogcG9pLnByb3BlcnRpZXMudHlwZS5waWN0b2dyYW1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgfTtcblxuICAgIHRoaXMuY3JlYXRlQ2x1c3Rlck1hcmtlckZyb21UcmVrID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgc3RhcnRQb2ludCA9IHRyZWtzU2VydmljZS5nZXRTdGFydFBvaW50KHRyZWspO1xuXG4gICAgICAgIHZhciBtYXJrZXIgPSBMLm1hcmtlcihbc3RhcnRQb2ludC5sYXQsIHN0YXJ0UG9pbnQubG5nXSwge1xuICAgICAgICAgICAgaWNvbjogaWNvbnNTZXJ2aWNlLmdldFRyZWtJY29uKClcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIG1hcmtlcjtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRTY2FsZSA9IGZ1bmN0aW9uKG1hcCkge1xuICAgICAgICBMLmNvbnRyb2wuc2NhbGUoe2ltcGVyaWFsOiBmYWxzZX0pLmFkZFRvKG1hcCk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0QXR0cmlidXRpb24gPSBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgbWFwLmF0dHJpYnV0aW9uQ29udHJvbC5zZXRQcmVmaXgoc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5BVFRSSUJVVElPTik7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0UG9zaXRpb25NYXJrZXIgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAvLyBQdWxzaW5nIG1hcmtlciBpbnNwaXJlZCBieVxuICAgICAgICAvLyBodHRwOi8vYmxvZy50aGVtYXRpY21hcHBpbmcub3JnLzIwMTQvMDYvcmVhbC10aW1lLXRyYWNraW5nLXdpdGgtc3BvdC1hbmQtbGVhZmV0Lmh0bWxcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJhZGl1czogNyxcbiAgICAgICAgICAgIGNvbG9yOiAnYmxhY2snLFxuICAgICAgICAgICAgZmlsbENvbG9yOiAnIzk4MWQ5NycsXG4gICAgICAgICAgICBmaWxsT3BhY2l0eTogMSxcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGVNYXJrZXInLFxuICAgICAgICAgICAgY2xhc3NOYW1lOiAnbGVhZmxldC1saXZlLXVzZXInLFxuICAgICAgICAgICAgd2VpZ2h0OiAyXG4gICAgICAgIH07XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIGljb25zU2VydmljZSgkd2luZG93KSB7XG5cbiAgICB2YXIgdHJla19pY29ucyA9IHtcbiAgICAgICAgZGVmYXVsdF9pY29uOiB7fSxcbiAgICAgICAgZGVwYXJ0dXJlX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL21hcmtlci1zb3VyY2UucG5nJyxcbiAgICAgICAgICAgIGljb25TaXplOiBbNjQsIDY0XSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFszMiwgNjRdLFxuICAgICAgICAgICAgbGFiZWxBbmNob3I6IFsyMCwgLTUwXVxuICAgICAgICB9KSxcbiAgICAgICAgYXJyaXZhbF9pY29uOiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9tYXJrZXItdGFyZ2V0LnBuZycsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzY0LCA2NF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMzIsIDY0XSxcbiAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBbMjAsIC01MF1cbiAgICAgICAgfSksXG4gICAgICAgIHBhcmtpbmdfaWNvbjogTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvcGFya2luZy5wbmcnLFxuICAgICAgICAgICAgaWNvblNpemU6IFszMiwgMzJdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzE2LCAxNl1cbiAgICAgICAgfSksXG4gICAgICAgIGluZm9ybWF0aW9uX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2luZm9ybWF0aW9uLnN2ZycsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzMyLCAzMl0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMTYsIDE2XVxuICAgICAgICB9KSxcbiAgICAgICAgcG9pX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBsYWJlbEFuY2hvcjogWzIwLCAtNTBdXG4gICAgICAgIH0pLFxuICAgICAgICB0cmVrX2ljb246IEwuZGl2SWNvbih7XG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyZWstaWNvbicsXG4gICAgICAgICAgICBsYWJlbEFuY2hvcjogWzIwLCAwXVxuICAgICAgICB9KVxuICAgIH07XG5cbiAgICB0aGlzLmdldFBPSUljb24gPSBmdW5jdGlvbihwb2kpIHtcbiAgICAgICAgdmFyIHBpY3RvZ3JhbVVybCA9IHBvaS5wcm9wZXJ0aWVzLnR5cGUucGljdG9ncmFtO1xuXG4gICAgICAgIHJldHVybiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogcGljdG9ncmFtVXJsLFxuICAgICAgICAgICAgaWNvblNpemU6IFszMiwgMzJdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzE2LCAxNl1cbiAgICAgICAgfSlcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRDbHVzdGVySWNvbiA9IGZ1bmN0aW9uKGNsdXN0ZXIpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBMLkRpdkljb24oe1xuICAgICAgICAgICAgaWNvblNpemU6IFs0MCwgNDBdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzIwLCAyMF0sXG4gICAgICAgICAgICBjbGFzc05hbWU6ICd0cmVrLWNsdXN0ZXInLFxuICAgICAgICAgICAgaHRtbDogJzxzcGFuIGNsYXNzPVwiY291bnRcIj4nICsgY2x1c3Rlci5nZXRDaGlsZENvdW50KCkgKyAnPC9zcGFuPidcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0RGVwYXJ0dXJlSWNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5kZXBhcnR1cmVfaWNvbjtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRBcnJpdmFsSWNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5hcnJpdmFsX2ljb247XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0UGFya2luZ0ljb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRyZWtfaWNvbnMucGFya2luZ19pY29uO1xuICAgIH07XG5cbiAgICB0aGlzLmdldEluZm9ybWF0aW9uSWNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5pbmZvcm1hdGlvbl9pY29uO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtJY29uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0cmVrX2ljb25zLnRyZWtfaWNvbjtcbiAgICB9O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1hcFNlcnZpY2U6IG1hcFNlcnZpY2UsXG4gICAgaWNvbnNTZXJ2aWNlOiBpY29uc1NlcnZpY2Vcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBpZD1cIm1hcFwiPlxcblxcbjwvZGl2Pic7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUcmVrc0xpc3RlQ29udHJvbGxlcigkc2NvcGUsIHRyZWtzU2VydmljZSkge1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlVHJla3MoKSB7XG4gICAgICAgIHRyZWtzU2VydmljZS5nZXRUcmVrcygpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmVrcyA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJla3MoKTtcbiAgICAgICAgXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVHJla3NMaXN0ZUNvbnRyb2xsZXI6IFRyZWtzTGlzdGVDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiB0cmVrc0xpc3RlRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLlRyZWtzTGlzdGVDb250cm9sbGVyXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NMaXN0ZURpcmVjdGl2ZTogdHJla3NMaXN0ZURpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLnRyZWtzJywgW10pXG4gICAgLnNlcnZpY2UoJ3RyZWtzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS50cmVrc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ1RyZWtzTGlzdGVDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLlRyZWtzTGlzdGVDb250cm9sbGVyKVxuICAgIC5kaXJlY3RpdmUoJ3RyZWtzTGlzdGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKS50cmVrc0xpc3RlRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHRyZWtzU2VydmljZShzZXR0aW5nc0ZhY3RvcnksICRyZXNvdXJjZSwgJHEsIGZpbHRlcnNTZXJ2aWNlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmdldFN0YXJ0UG9pbnQgPSBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgIHZhciBmaXJzdFBvaW50Q29vcmRpbmF0ZXMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdO1xuXG4gICAgICAgIHJldHVybiB7J2xhdCc6IGZpcnN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogZmlyc3RQb2ludENvb3JkaW5hdGVzWzBdfVxuICAgIH07XG5cbiAgICB0aGlzLmdldEVuZFBvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgbmJQdHMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGxhc3RQb2ludENvb3JkaW5hdGVzID0gdHJlay5nZW9tZXRyeS5jb29yZGluYXRlc1tuYlB0cy0xXTtcblxuICAgICAgICByZXR1cm4geydsYXQnOiBsYXN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogbGFzdFBvaW50Q29vcmRpbmF0ZXNbMF19XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0UGFya2luZ1BvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgcGFya2luZ0Nvb3JkaW5hdGVzID0gdHJlay5wcm9wZXJ0aWVzLnBhcmtpbmdfbG9jYXRpb247XG5cbiAgICAgICAgcmV0dXJuIHBhcmtpbmdDb29yZGluYXRlcyA/IHsnbGF0JzogcGFya2luZ0Nvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgICAgICdsbmcnOiBwYXJraW5nQ29vcmRpbmF0ZXNbMF19IDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnJlcGxhY2VJbWdVUkxzID0gZnVuY3Rpb24gKHRyZWtzRGF0YSkgeyAgICAgICAgXG5cbiAgICAgICAgLy8gUGFyc2UgdHJlayBwaWN0dXJlcywgYW5kIGNoYW5nZSB0aGVpciBVUkxcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzRGF0YS5mZWF0dXJlcywgZnVuY3Rpb24odHJlaykge1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5waWN0dXJlcywgZnVuY3Rpb24ocGljdHVyZSnCoHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlLnVybCA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyBwaWN0dXJlLnVybDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy51c2FnZXMsIGZ1bmN0aW9uKHVzYWdlKcKge1xuICAgICAgICAgICAgICAgIHVzYWdlLnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB1c2FnZS5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMudGhlbWVzLCBmdW5jdGlvbih0aGVtZSnCoHtcbiAgICAgICAgICAgICAgICB0aGVtZS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdGhlbWUucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLm5ldHdvcmtzLCBmdW5jdGlvbihuZXR3b3JrKcKge1xuICAgICAgICAgICAgICAgIG5ldHdvcmsucGljdG9ncmFtID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIG5ldHdvcmsucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmluZm9ybWF0aW9uX2Rlc2tzLCBmdW5jdGlvbihpbmZvcm1hdGlvbl9kZXNrKcKge1xuICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMudGh1bWJuYWlsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHRyZWsucHJvcGVydGllcy50aHVtYm5haWw7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkucGljdG9ncmFtO1xuICAgICAgICAgICAgdHJlay5wcm9wZXJ0aWVzLmFsdGltZXRyaWNfcHJvZmlsZSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0cmVrLnByb3BlcnRpZXMuYWx0aW1ldHJpY19wcm9maWxlLnJlcGxhY2UoXCIuanNvblwiLCBcIi5zdmdcIik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJla3NEYXRhO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3RyZWtMaXN0KSB7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2VsZi5fdHJla0xpc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gc2V0dGluZ3NGYWN0b3J5LnRyZWtzVXJsO1xuXG4gICAgICAgICAgICB2YXIgcmVxdWVzdHMgPSAkcmVzb3VyY2UodXJsLCB7fSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RzLnF1ZXJ5KCkuJHByb21pc2VcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGFuZ3VsYXIuZnJvbUpzb24oZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0ZWRJbWdzID0gc2VsZi5yZXBsYWNlSW1nVVJMcyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fdHJla0xpc3QgPSBjb252ZXJ0ZWRJbWdzO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbnZlcnRlZEltZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgIH07XG5cbiAgICB0aGlzLmZpbHRlclRyZWtzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGZpbHRlcmVkVHJla3MgPSBmaWx0ZXJzU2VydmljZS5maWx0ZXJUcmVrcygpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbHRlcmVkVHJla3MpO1xuXG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cmVrc1NlcnZpY2U6IHRyZWtzU2VydmljZVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8c2VjdGlvbiBjbGFzcz1cInRyZWtzLWxpc3RlXCI+XFxuICAgIDxhcnRpY2xlIG5nLXJlcGVhdD1cInRyZWsgaW4gdHJla3MuZmVhdHVyZXNcIiBuZy1pZD1cInRyZWste3t0cmVrLmlkfX1cIiBjbGFzcz1cInRyZWsgY29sLXNtLTEyIGNvbC1tZC02XCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmlzdWFsXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZhdi1vci1ub3RcIj5cXG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWhlYXJ0XCI+PC9pPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxpbWcgbmctc3JjPVwie3t0cmVrLnByb3BlcnRpZXMucGljdHVyZXNbMF0udXJsfX1cIiBuZy1hbHQ9XCJ7e3RyZWsucHJvcGVydGllcy5waWN0dXJlc1swXS50aXRsZX19XCI+ICAgIFxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8aDEgY2xhc3M9XCJ0aXRsZVwiPnt7dHJlay5wcm9wZXJ0aWVzLm5hbWV9fTwvaDE+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5mb3NcIj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy5kaXN0cmljdHNbMF0ubmFtZX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLmR1cmF0aW9uX3ByZXR0eX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPkTDqW5pdmVsw6kge3t0cmVrLnByb3BlcnRpZXMuYXNjZW50fX0gLSA8L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4+e3t0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5sYWJlbH19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLnVzYWdlc1swXS5sYWJlbH19PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8dWwgY2xhc3M9XCJ0aGVtZXNcIj5cXG4gICAgICAgICAgICA8bGkgbmctcmVwZWF0PVwidGhlbWUgaW4gdHJlay5wcm9wZXJ0aWVzLnRoZW1lc1wiPlxcbiAgICAgICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7dGhlbWUucGljdG9ncmFtfX1cIiBuZy1hbHQ9XCJ7e3RoZW1lLmxhYmVsfX1cIj5cXG4gICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJrbm93LW1vcmVcIj5cXG4gICAgICAgICAgICA8c3Bhbj4rPC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgIDwvYXJ0aWNsZT5cXG48L3NlY3Rpb24+JzsiXX0=
