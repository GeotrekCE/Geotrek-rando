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
    var DOMAIN = /*'http://192.168.100.44:8888'*/'http://prod-rando-fr.makina-corpus.net/',

        //PATHS AND DIRECTORY
        FILES_DIR = 'files/api',
        TREK_DIR = 'trek',
        TILES_DIR = 'tiles',

        TREKS_FILE = 'trek.geojson',
        //POI_FILE = 'pois.geojson',

        MAIN_LEAFLET_BACKGROUND = {
            LAYER_URL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ATTRIBUTION: '(c) IGN Geoportail'
        },
        SATELLITE_LEAFLET_BACKGROUND = {
            LAYER_URL: 'http://{s}.tile.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png',
            ATTRIBUTION: '(c) MapBox Satellite'
        },

        LEAFLET_CONF = {
            CENTER_LATITUDE: 44.83,
            CENTER_LONGITUDE: 6.34,
            DEFAULT_ZOOM: 12,
            DEFAULT_MIN_ZOOM: 8,
            DEFAULT_MAX_ZOOM: 16,
            TREK_COLOR: '#F89406'
        };

    // PRIVATE VAR
    //
    var _activeLang = globalSettings.DEFAULT_LANGUAGE;


    // PUBLIC VAR
    //
    var treksUrl =  DOMAIN + '/' + _activeLang + '/' + FILES_DIR + '/' + TREK_DIR + '/' + TREKS_FILE,
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
        MAIN_LEAFLET_BACKGROUND: MAIN_LEAFLET_BACKGROUND,
        SATELLITE_LEAFLET_BACKGROUND: SATELLITE_LEAFLET_BACKGROUND,
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
    
    var map;

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

        var mapSelector = parameters[0] || 'map';

        map = mapService.initMap(mapSelector);

        // Load treks in map
        mapService.displayTreks($scope.treks.features);

    }

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

    var self = this;

    this.initMap = function (mapSelector) {

        // Set background Layers
        this._baseLayers = {
            main: L.tileLayer(
                settingsFactory.MAIN_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'main',
                    attribution: settingsFactory.MAIN_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            ),
            satellite: L.tileLayer(
                settingsFactory.SATELLITE_LEAFLET_BACKGROUND.LAYER_URL,
                {
                    id: 'satellite',
                    attribution: settingsFactory.SATELLITE_LEAFLET_BACKGROUND.ATTRIBUTION
                }
            )
        };

        var mapParameters = {
            center: [settingsFactory.LEAFLET_CONF.CENTER_LATITUDE, settingsFactory.LEAFLET_CONF.CENTER_LONGITUDE],
            zoom: settingsFactory.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: settingsFactory.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            layers: this._baseLayers.main
        };

        //Mixins for map
        this.initCustomsMixins();

        this._map = L.map(mapSelector, mapParameters);

        // Set-up maps controls (needs _map to be defined);
        this.initMapControls();

        this.createTreksLayer();

        return map;
    };

    this.createTreksLayer = function () {

        this._treksLayer = new L.MarkerClusterGroup({
            showCoverageOnHover: false,
            iconCreateFunction: function(cluster) {
                return iconsService.getClusterIcon(cluster);
            }
        });

    };

    // Add treks geojson to the map
    this.displayTreks = function (trekCollection) {
        // Remove all markers so the displayed markers can fit the search results
        this._treksLayer.clearLayers();

        //$scope.mapService = mapService;
        angular.forEach(trekCollection, function(trek) {
            var trekDeparture = self.createClusterMarkerFromTrek(trek);
            trekDeparture.on({
                click: function(e) {
                    console.log('marker Clicked');
                    //$state.go("home.map.detail", { trekId: trek.id });
                }
            });
            self._treksLayer.addLayer(trekDeparture);
        });
        this._map.addLayer(this._treksLayer);

        /*if ((updateBounds == undefined) || (updateBounds == true)) {    
            this._map.fitBounds(this._treksLayer.getBounds());
        }*/
    };

    // MARKERS AND CLUSTERS  //////////////////////////////
    //
    //
    var _markers = [];

    this.getMarkers = function () {
        return _markers;
    };

    this.setMarkers = function (markers) {
        _markers = markers;
    };

    this.createMarkersFromTrek = function (trek, pois) {
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
        angular.forEach(trek.properties.information_desks, function (information) {
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

        angular.forEach(pois, function (poi) {
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

    this.createClusterMarkerFromTrek = function (trek) {
        var startPoint = treksService.getStartPoint(trek);

        var marker = L.marker([startPoint.lat, startPoint.lng], {
            icon: iconsService.getTrekIcon()
        });

        return marker;
    };


    // UI CONTROLS //////////////////////////////
    //
    //

    this.initMapControls = function () {
        this.setScale();
        this.setAttribution();
        this.setZoomControlPosition();
        this.setFullScreenControll();
        this.createSatelliteView();
    }

    this.setScale = function () {
        L.control.scale({imperial: false}).addTo(this._map);
    };

    this.setZoomControlPosition = function () {
        this._map.zoomControl.setPosition('topright');
    };

    this.setFullScreenControll = function () {
        L.control.fullscreen({
            position: 'topright',
            title: 'Fullscreen'
        }).addTo(this._map);
    };

    this.setAttribution = function () {
        this._map.attributionControl.setPrefix(settingsFactory.LEAFLET_CONF.ATTRIBUTION);
    };

    this.setPositionMarker = function () {

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

    this.createSatelliteView = function () {
        L.Control.SwitchBackgroundLayers = L.Control.extend({
            options: {
                position: 'bottomleft',
            },

            onAdd: function (map) {

                this.map = map;

                this.switch_detail_zoom = $(map._container).data('switch-detail-zoom');
                if (this.switch_detail_zoom > 0) {
                    map.on('zoomend', function (e) {
                        if (map.isShowingLayer('satellite'))
                            return;
                        if (e.target.getZoom() > this.switch_detail_zoom) {
                            if (!map.isShowingLayer('detail'))
                                setTimeout(function () { map.switchLayer('detail'); }, 100);
                        }
                        else {
                            if (!map.isShowingLayer('main'))
                                setTimeout(function () { map.switchLayer('main'); }, 100);
                        }
                    }, this);
                }

                this._container = L.DomUtil.create('div', 'simple-layer-switcher');

                var className = 'toggle-layer background satellite';

                this.button = L.DomUtil.create('a', className, this._container);
                this.button.setAttribute('title', 'Show satellite');
                $(this.button).tooltip({placement: 'right',
                                        container: map._container});

                L.DomEvent.disableClickPropagation(this.button);
                L.DomEvent.on(this.button, 'click', function (e) {
                    this.toggleLayer();
                }, this);

                return this._container;
            },

            toggleLayer: function () {
                
                if (this.map.isShowingLayer('main') || this.map.isShowingLayer('detail')) {
                    this.map.switchLayer('satellite');

                    L.DomUtil.removeClass(this.button, 'satellite');
                    L.DomUtil.addClass(this.button, 'main');
                    this.button.setAttribute('title', 'Show plan');
                }
                else {
                    this.map.switchLayer(this.map.getZoom() > this.switch_detail_zoom ?
                                         'detail' : 'main');

                    L.DomUtil.removeClass(this.button, 'main');
                    L.DomUtil.addClass(this.button, 'satellite');
                    this.button.setAttribute('title', 'Show satellite');
                }

                $(this.button).tooltip('destroy');
                $(this.button).tooltip({placement: 'right',
                                        container: this.map._container});
            }

        });

        var switchControl = new L.Control.SwitchBackgroundLayers();
            switchControl.addTo(this._map);
    };


    // CUSTOM MIXINS //////////////////////////////
    //
    //
    this.initCustomsMixins = function () {
        this.addMapLayersMixin();
        this.topPadding();
        this.addFakeBoundsMixin();
        //this.togglePoiLayer();
    }

    this.addMapLayersMixin = function () {
        var LayerSwitcherMixin = {

            isShowingLayer: function (name) {
                if (this.hasLayer(self._baseLayers[name])) {
                    return true;
                } else {
                    return false;
                }
            },

            switchLayer: function (destLayer) {
                for (var base in self._baseLayers) { 
                    if (this.hasLayer(self._baseLayers[base]) && self._baseLayers[base] != self._baseLayers[destLayer]) { 
                        this.removeLayer(self._baseLayers[base]); 
                    }
                }
                this.addLayer(self._baseLayers[destLayer]);
            }
        };

        L.Map.include(LayerSwitcherMixin);
    }

    this.topPadding = function () {
        L.LatLngBounds.prototype.padTop = function (bufferRatio) {
            var sw = this._southWest,
                ne = this._northEast,
                heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio;

            return new L.LatLngBounds(
                    new L.LatLng(sw.lat, sw.lng),
                    new L.LatLng(ne.lat + heightBuffer, ne.lng));

        };
    };

    this.addFakeBoundsMixin = function () {
        var FakeBoundsMapMixin = {
            __fakeBounds: function (bounds) {
                /* Depending on sidebar open/close, we correct the bounds of the map
                If init, we increase, else we reduce.
                */
                if (!this._loaded)
                    return bounds;

                var mapBounds = this.getBounds(),
                    from = arguments.length === 0;
                bounds = from ? mapBounds : bounds;

                var closed = $('#side-bar').hasClass('closed');
                if (closed) {
                    return bounds;
                }

                var sidebarW = $('#side-bar').outerWidth() / $('#mainmap').width(),
                    boundswidth = mapBounds.getSouthEast().lng - mapBounds.getSouthWest().lng,
                    offset = sidebarW * boundswidth * (from ? 1 : -1);

                var oldSouthWest = bounds.getSouthWest(),
                    southWest = L.latLng(oldSouthWest.lat, oldSouthWest.lng + offset);
                return L.latLngBounds(southWest, bounds.getNorthEast());
            },

            fitFakeBounds: function (bounds) {
                this.fitBounds(bounds);
                this.whenReady(function () {
                    this.fitBounds(this.__fakeBounds(bounds));
                }, this);
            },

            getFakeBounds: function () {
                return this.__fakeBounds();
            },

            fakePanTo: function (latlng) {
                var bounds = new L.LatLngBounds([latlng, latlng]),
                    fakeBounds = this.__fakeBounds(bounds);
                this.panTo(fakeBounds.getCenter());
            },

            panToOffset: function (latlng, offset, options) {
                var x = this.latLngToContainerPoint(latlng).x - offset[0];
                var y = this.latLngToContainerPoint(latlng).y - offset[1];
                var point = this.containerPointToLatLng([x, y]);

                var current = this.latLngToContainerPoint(this.getCenter());

                if (L.point(x, y).distanceTo(current) < options.minimumDistance)
                    return;

                return this.setView(point, this._zoom, { pan: options })
            }
        };

        L.Map.include(FakeBoundsMapMixin);
    }

    this.togglePoiLayer = function () {
        L.Control.TogglePOILayer = L.Control.extend({
        options: {
            position: 'bottomleft',
        },

        initialize: function (layer, options) {
            this.layer = layer;
            L.Control.prototype.initialize.call(this, options);
        },

        onAdd: function(map) {
            this.map = map;

            this._container = L.DomUtil.create('div', 'simple-layer-switcher pois');
            var className = 'toggle-layer pois active';
            this.button = L.DomUtil.create('a', className, this._container);
            this.button.setAttribute('title', gettext('Points of interest'));
            $(this.button).tooltip({placement: 'right'});

            L.DomEvent.disableClickPropagation(this.button);
            L.DomEvent.on(this.button, 'click', function (e) {
                this.toggleLayer();
            }, this);

            return this._container;
        },

        toggleLayer: function () {
            if (this.layer) {
                if (this.map.hasLayer(this.layer)) {
                    $(window).trigger('pois:hidden');
                    L.DomUtil.removeClass(this.button, 'active');
                    this.map.removeLayer(this.layer);
                }
                else {
                    $(window).trigger('pois:shown');
                    L.DomUtil.addClass(this.button, 'active');
                    this.map.addLayer(this.layer);
                }
            }
        }

    });
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

    this.getPOIIcon = function (poi) {
        var pictogramUrl = poi.properties.type.pictogram;

        return L.icon({
            iconUrl: pictogramUrl,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        })
    };

    this.getClusterIcon = function (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            className: 'trek-cluster',
            html: '<span class="count">' + cluster.getChildCount() + '</span>'
        });
    };

    this.getDepartureIcon = function () {
        return trek_icons.departure_icon;
    };

    this.getArrivalIcon = function () {
        return trek_icons.arrival_icon;
    };

    this.getParkingIcon = function () {
        return trek_icons.parking_icon;
    };

    this.getInformationIcon = function () {
        return trek_icons.information_icon;
    };

    this.getTrekIcon = function () {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwL2FwcC5qcyIsInNyYy9hcHAvY29uZmlnL2ZhY3Rvcmllcy5qcyIsInNyYy9hcHAvY29uZmlnL2luZGV4LmpzIiwic3JjL2FwcC9maWx0ZXJzL2luZGV4LmpzIiwic3JjL2FwcC9maWx0ZXJzL3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvY29udHJvbGxlcnMuanMiLCJzcmMvYXBwL2xheW91dC9pbmRleC5qcyIsInNyYy9hcHAvbGF5b3V0L3JvdXRlcy5qcyIsInNyYy9hcHAvbGF5b3V0L3NlcnZpY2VzLmpzIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2Zvb3Rlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2hlYWRlci5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL2xheW91dC5odG1sIiwic3JjL2FwcC9sYXlvdXQvdGVtcGxhdGVzL3NpZGViYXIuaHRtbCIsInNyYy9hcHAvbWFwL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC9tYXAvZGlyZWN0aXZlcy5qcyIsInNyYy9hcHAvbWFwL2luZGV4LmpzIiwic3JjL2FwcC9tYXAvc2VydmljZXMuanMiLCJzcmMvYXBwL21hcC90ZW1wbGF0ZXMvbWFwLmh0bWwiLCJzcmMvYXBwL3RyZWtzL2NvbnRyb2xsZXJzLmpzIiwic3JjL2FwcC90cmVrcy9kaXJlY3RpdmVzLmpzIiwic3JjL2FwcC90cmVrcy9pbmRleC5qcyIsInNyYy9hcHAvdHJla3Mvc2VydmljZXMuanMiLCJzcmMvYXBwL3RyZWtzL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdCQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZXBlbmRlbmNpZXMgPSBbXG4gICAgLy8gT3VyIHN1Ym1vZHVsZXNcbiAgICAncmFuZG8uY29uZmlnJywgJ3JhbmRvLnRyZWtzJywgJ3JhbmRvLmxheW91dCcsICdyYW5kby5tYXAnLCAncmFuZG8uZmlsdGVycycsXG5cbiAgICAvLyBFeHRlcm5hbCBzdHVmZlxuICAgICd1aS5yb3V0ZXInLCAnbmdSZXNvdXJjZSdcbl07XG5cbmFuZ3VsYXIubW9kdWxlKCdnZW90cmVrUmFuZG8nLCBkZXBlbmRlbmNpZXMpO1xuXG4vLyBSZXF1aXJlIEdlb3RyZWsgY29tcG9uZW50c1xucmVxdWlyZSgnLi9jb25maWcnKTtcbi8vcmVxdWlyZSgnLi9jb21tb25zJyk7XG5yZXF1aXJlKCcuL2xheW91dCcpO1xucmVxdWlyZSgnLi90cmVrcycpO1xucmVxdWlyZSgnLi9tYXAnKTtcbnJlcXVpcmUoJy4vZmlsdGVycycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBzZXR0aW5nc0ZhY3RvcnkoZ2xvYmFsU2V0dGluZ3MpIHtcblxuICAgIC8vIENPTlNUQU5UUyBWQVIgdGhhdCB1c2VyIGNhbiBjaGFuZ2VcbiAgICAvL1xuICAgIHZhciBET01BSU4gPSAvKidodHRwOi8vMTkyLjE2OC4xMDAuNDQ6ODg4OCcqLydodHRwOi8vcHJvZC1yYW5kby1mci5tYWtpbmEtY29ycHVzLm5ldC8nLFxuXG4gICAgICAgIC8vUEFUSFMgQU5EIERJUkVDVE9SWVxuICAgICAgICBGSUxFU19ESVIgPSAnZmlsZXMvYXBpJyxcbiAgICAgICAgVFJFS19ESVIgPSAndHJlaycsXG4gICAgICAgIFRJTEVTX0RJUiA9ICd0aWxlcycsXG5cbiAgICAgICAgVFJFS1NfRklMRSA9ICd0cmVrLmdlb2pzb24nLFxuICAgICAgICAvL1BPSV9GSUxFID0gJ3BvaXMuZ2VvanNvbicsXG5cbiAgICAgICAgTUFJTl9MRUFGTEVUX0JBQ0tHUk9VTkQgPSB7XG4gICAgICAgICAgICBMQVlFUl9VUkw6ICdodHRwOi8ve3N9LnRpbGUub3BlbnN0cmVldG1hcC5vcmcve3p9L3t4fS97eX0ucG5nJyxcbiAgICAgICAgICAgIEFUVFJJQlVUSU9OOiAnKGMpIElHTiBHZW9wb3J0YWlsJ1xuICAgICAgICB9LFxuICAgICAgICBTQVRFTExJVEVfTEVBRkxFVF9CQUNLR1JPVU5EID0ge1xuICAgICAgICAgICAgTEFZRVJfVVJMOiAnaHR0cDovL3tzfS50aWxlLm1hcGJveC5jb20vdjMvbWFraW5hLWNvcnB1cy5pM3AxMDAxbC97en0ve3h9L3t5fS5wbmcnLFxuICAgICAgICAgICAgQVRUUklCVVRJT046ICcoYykgTWFwQm94IFNhdGVsbGl0ZSdcbiAgICAgICAgfSxcblxuICAgICAgICBMRUFGTEVUX0NPTkYgPSB7XG4gICAgICAgICAgICBDRU5URVJfTEFUSVRVREU6IDQ0LjgzLFxuICAgICAgICAgICAgQ0VOVEVSX0xPTkdJVFVERTogNi4zNCxcbiAgICAgICAgICAgIERFRkFVTFRfWk9PTTogMTIsXG4gICAgICAgICAgICBERUZBVUxUX01JTl9aT09NOiA4LFxuICAgICAgICAgICAgREVGQVVMVF9NQVhfWk9PTTogMTYsXG4gICAgICAgICAgICBUUkVLX0NPTE9SOiAnI0Y4OTQwNidcbiAgICAgICAgfTtcblxuICAgIC8vIFBSSVZBVEUgVkFSXG4gICAgLy9cbiAgICB2YXIgX2FjdGl2ZUxhbmcgPSBnbG9iYWxTZXR0aW5ncy5ERUZBVUxUX0xBTkdVQUdFO1xuXG5cbiAgICAvLyBQVUJMSUMgVkFSXG4gICAgLy9cbiAgICB2YXIgdHJla3NVcmwgPSAgRE9NQUlOICsgJy8nICsgX2FjdGl2ZUxhbmcgKyAnLycgKyBGSUxFU19ESVIgKyAnLycgKyBUUkVLX0RJUiArICcvJyArIFRSRUtTX0ZJTEUsXG4gICAgICAgIGZpbHRlcnMgPSB7XG4gICAgICAgICAgICBkdXJhdGlvbnMgOiBbXG4gICAgICAgICAgICAgICAgeyBpZDogNCwgbmFtZTogJzwxLzIgSicsIGludGVydmFsOiBbMCwgNF19LFxuICAgICAgICAgICAgICAgIHsgaWQ6IDEwLCBuYW1lOiAnMS8yIC0gMScsIGludGVydmFsOiBbNCwgMTBdIH0sXG4gICAgICAgICAgICAgICAgeyBpZDogMjQsIG5hbWU6ICc+IDEgSicsIGludGVydmFsOiBbMTAsIDk5OTk5XX1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBlbGV2YXRpb25zIDogIFtcbiAgICAgICAgICAgICAgICB7IGlkOiAwLCBuYW1lOiAnPDMwMG0nLCBpbnRlcnZhbDogWzAsIDMwMF0gfSxcbiAgICAgICAgICAgICAgICB7IGlkOiAzMDAsIG5hbWU6ICczMDAtNjAwJywgaW50ZXJ2YWw6IFszMDEsIDYwMF0gfSxcbiAgICAgICAgICAgICAgICB7IGlkOiA2MDAsIG5hbWU6ICc2MDAtMTAwMCcsIGludGVydmFsOiBbNjAxLCAxMDAwXSB9LFxuICAgICAgICAgICAgICAgIHsgaWQ6IDEwMDAsIG5hbWU6ICc+MTAwMG0nLCBpbnRlcnZhbDogWzEwMDEsIDk5OTk5XSB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAvL1BVQkxJQyBNRVRIT0RTXG4gICAgLy9cbiAgICB2YXIgc2V0TGFuZyA9IGZ1bmN0aW9uIChuZXdMYW5nKSB7XG4gICAgICAgIF9hY3RpdmVMYW5nID0gbmV3TGFuZztcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIHZhciBnZXRMYW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX2FjdGl2ZUxhbmc7XG4gICAgfTtcblxuXG5cbiAgICByZXR1cm4ge1xuICAgICAgICAvL0NPTlNUQU5UU1xuICAgICAgICBET01BSU46IERPTUFJTixcbiAgICAgICAgTUFJTl9MRUFGTEVUX0JBQ0tHUk9VTkQ6IE1BSU5fTEVBRkxFVF9CQUNLR1JPVU5ELFxuICAgICAgICBTQVRFTExJVEVfTEVBRkxFVF9CQUNLR1JPVU5EOiBTQVRFTExJVEVfTEVBRkxFVF9CQUNLR1JPVU5ELFxuICAgICAgICBMRUFGTEVUX0NPTkY6IExFQUZMRVRfQ09ORixcblxuICAgICAgICAvL1BVQkxJQyBWQVJcbiAgICAgICAgdHJla3NVcmw6IHRyZWtzVXJsLFxuICAgICAgICBmaWx0ZXJzOiBmaWx0ZXJzLFxuXG4gICAgICAgIC8vTUVUSE9EU1xuICAgICAgICBzZXRMYW5nOiBzZXRMYW5nLFxuICAgICAgICBnZXRMYW5nOiBnZXRMYW5nXG5cbiAgICB9O1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHNldHRpbmdzRmFjdG9yeTogc2V0dGluZ3NGYWN0b3J5XG59OyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLmNvbmZpZycsIFtdKVxuICAgIC5jb25zdGFudCgnZ2xvYmFsU2V0dGluZ3MnLCB7XG4gICAgICAgIERFRkFVTFRfTEFOR1VBR0U6ICdmcidcbiAgICB9KVxuICAgIC5mYWN0b3J5KCdzZXR0aW5nc0ZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3RvcmllcycpLnNldHRpbmdzRmFjdG9yeSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgncmFuZG8uZmlsdGVycycsIFtdKVxuICAgIC5zZXJ2aWNlKCdmaWx0ZXJzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5maWx0ZXJzU2VydmljZSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBmaWx0ZXJzU2VydmljZSgkcSwgJHNjZSwgc2V0dGluZ3NGYWN0b3J5KSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBHZXQgZGVmYXVsdCB2YWx1ZSBmb3IgZWFjaCBmaWx0ZXIgZmllbGRcbiAgICB0aGlzLmdldERlZmF1bHRBY3RpdmVGaWx0ZXJWYWx1ZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRpZmZpY3VsdHk6ICAge30sXG4gICAgICAgICAgICBkdXJhdGlvbjogICAgIHt9LFxuICAgICAgICAgICAgZWxldmF0aW9uOiAgICB7fSxcbiAgICAgICAgICAgIGRvd25sb2FkOiAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgdGhlbWU6ICAgICAgICB1bmRlZmluZWQsXG4gICAgICAgICAgICBtdW5pY2lwYWxpdHk6IG51bGwsXG4gICAgICAgICAgICB1c2U6ICAgICAgICAgIG51bGwsXG4gICAgICAgICAgICB2YWxsZXk6ICAgICAgIG51bGwsXG4gICAgICAgICAgICByb3V0ZTogICAgICAgIG51bGwsXG4gICAgICAgICAgICBzZWFyY2g6ICAgICAgICcnXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5pc1ZhbGlkRmlsdGVyID0gZnVuY3Rpb24odmFsdWUsIGZpbHRlcikge1xuICAgICAgICB2YXIgdmFsaWQgPSB0cnVlO1xuICAgICAgICBpZiAoYW5ndWxhci5pc1VuZGVmaW5lZCh2YWx1ZSlcbiAgICAgICAgICAgIHx8IGFuZ3VsYXIuaXNVbmRlZmluZWQoZmlsdGVyKVxuICAgICAgICAgICAgfHwgKGZpbHRlciA9PT0gbnVsbClcbiAgICAgICAgICAgIHx8ICh2YWx1ZSA9PT0gbnVsbClcbiAgICAgICAgICAgIHx8IChhbmd1bGFyLmVxdWFscyhmaWx0ZXIsIHt9KSkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdmFsaWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbGlkO1xuICAgIH07XG5cbiAgICAvLyBHZW5lcmljIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIG9uIGhhcmRjb2RlZCBmaWx0ZXJzXG4gICAgdGhpcy5maWx0ZXJUcmVrV2l0aEZpbHRlciA9IGZ1bmN0aW9uKHRyZWtWYWx1ZSwgZmlsdGVyKSB7XG5cbiAgICAgICAgLy8gVHJlayBjb25zaWRlcmVkIGFzIG1hdGNoaW5nIGlmIGZpbHRlciBub3Qgc2V0IG9yIGlmXG4gICAgICAgIC8vIHByb3BlcnR5IGlzIGVtcHR5LlxuICAgICAgICB2YXIgaXNfdmFsaWQgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWRGaWx0ZXIodHJla1ZhbHVlLCBmaWx0ZXIpKSB7XG4gICAgICAgICAgICBpZihhbmd1bGFyLmlzTnVtYmVyKGZpbHRlcikpe1xuICAgICAgICAgICAgICAgIGlzX3ZhbGlkID0gdHJla1ZhbHVlIDw9IGZpbHRlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmaWx0ZXIpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmlsdGVyW2tleXNbaV1dID09PSB0cnVlICl7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBjb21iaW5lZCBmaWx0ZXJzIGlmIG9uZSBmaWx0ZXIgaXMgdmFsaWQsIG5vIG5lZWQgdG8gbG9vayBvbiB0aGUgb3RoZXJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9SIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJla1ZhbHVlIDw9IHBhcnNlRmxvYXQoa2V5c1tpXSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc192YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNfdmFsaWQ7XG4gICAgfTtcblxuICAgIC8vIEdlbmVyaWMgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgb24gaGFyZGNvZGVkIHJhbmdlIGZpbHRlcnNcbiAgICB0aGlzLmZpbHRlclRyZWtXaXRoSW50ZXJ2YWwgPSBmdW5jdGlvbih0cmVrVmFsdWUsIGZpbHRlcnMpIHtcbiAgICAgICAgdmFyIGlzX3ZhbGlkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhmaWx0ZXJzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gZmlsdGVyc1trZXlzW2ldXTtcbiAgICAgICAgICAgIGlmIChmaWx0ZXIuY2hlY2tlZCA9PT0gdHJ1ZSApe1xuICAgICAgICAgICAgICAgIC8vIEluIGNvbWJpbmVkIGZpbHRlcnMgaWYgb25lIGZpbHRlciBpcyB2YWxpZCwgbm8gbmVlZCB0byBsb29rIG9uIHRoZSBvdGhlclxuICAgICAgICAgICAgICAgIC8vIE9SIG9wZXJhdG9yXG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlRmxvYXQodHJla1ZhbHVlKSA+PSBwYXJzZUZsb2F0KGZpbHRlci5pbnRlcnZhbFswXSkgJiYgcGFyc2VGbG9hdCh0cmVrVmFsdWUpIDw9IHBhcnNlRmxvYXQoZmlsdGVyLmludGVydmFsWzFdKSl7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNle1xuICAgICAgICAgICAgICAgICAgICBpc192YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGlzX3ZhbGlkO1xuICAgIH07XG5cbiAgICAvLyBHZW5lcmljIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIG9uIGhhcmRjb2RlZCBmaWx0ZXJzXG4gICAgdGhpcy5maWx0ZXJUcmVrRXF1YWxzID0gZnVuY3Rpb24odHJla1ZhbHVlLCBmaWx0ZXIpIHtcblxuICAgICAgICB2YXIgaXNfdmFsaWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5pc1ZhbGlkRmlsdGVyKHRyZWtWYWx1ZSwgZmlsdGVyKSkge1xuICAgICAgICAgICAgaWYoYW5ndWxhci5pc051bWJlcihmaWx0ZXIpKXtcbiAgICAgICAgICAgICAgICBpc192YWxpZCA9IHRyZWtWYWx1ZSA9PT0gZmlsdGVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGZpbHRlcik7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWx0ZXJba2V5c1tpXV0gPT09IHRydWUgKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluIGNvbWJpbmVkIGZpbHRlcnMgaWYgb25lIGZpbHRlciBpcyB2YWxpZCwgbm8gbmVlZCB0byBsb29rIG9uIHRoZSBvdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gT1Igb3BlcmF0b3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJzZUZsb2F0KHRyZWtWYWx1ZSkgPT09IHBhcnNlRmxvYXQoa2V5c1tpXSkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc192YWxpZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNfdmFsaWQ7XG4gICAgfTtcblxuICAgIC8vIEdlbmVyaWMgZnVuY3Rpb24gdGhhdCBpcyBjYWxsZWQgb24gc2VsZWN0IGZpbHRlcnNcbiAgICB0aGlzLmZpbHRlclRyZWtXaXRoU2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0T3B0aW9uVmFsdWVzLCBmb3JtVmFsdWUsIGZpZWxkVG9DaGVjaykge1xuICAgICAgICAvLyBUcmVrIGNvbnNpZGVyZWQgYXMgbWF0Y2hpbmcgaWYgZmlsdGVyIG5vdCBzZXQgb3IgaWZcbiAgICAgICAgLy8gcHJvcGVydHkgaXMgZW1wdHkuXG4gICAgICAgIGlmICghKHRoaXMuaXNWYWxpZEZpbHRlcihzZWxlY3RPcHRpb25WYWx1ZXMsIGZvcm1WYWx1ZSkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KHNlbGVjdE9wdGlvblZhbHVlcykpIHtcbiAgICAgICAgICAgIHNlbGVjdE9wdGlvblZhbHVlcyA9IFtzZWxlY3RPcHRpb25WYWx1ZXNdO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNpbmcgbmF0aXZlIGxvb3BzIGluc3RlYWQgb2YgYW5ndWxhcmpzIGZvckVhY2ggYmVjYXVzZSB3ZSB3YW50IHRvIHN0b3Agc2VhcmNoaW5nXG4gICAgICAgIC8vIHdoZW4gdmFsdWUgaGFzIGJlZW4gZm91bmRcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGVjdE9wdGlvblZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGZpZWxkVmFsdWUgPSBzZWxlY3RPcHRpb25WYWx1ZXNbaV1bZmllbGRUb0NoZWNrXTtcbiAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzVW5kZWZpbmVkKGZpZWxkVmFsdWUpIHx8IChmaWVsZFZhbHVlID09PSBmb3JtVmFsdWUudmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICAvLyBGdW5jdGlvbiBjYWxsZWQgZWFjaCB0aW1lIGEgZmlsdGVyIGlzIG1vZGlmaWVkLCB0byBrbm93IHdoaWNoIHRyZWtzIHRvIGRpc3BsYXlcbiAgICB0aGlzLmZpbHRlclRyZWtzID0gZnVuY3Rpb24odHJla3MsIGFjdGl2ZUZpbHRlcnMpIHtcbiAgICAgICAgdmFyIGZpbHRlcmVkVHJla3MgPSBbXTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzLCBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5maWx0ZXJUcmVrRXF1YWxzKHRyZWsucHJvcGVydGllcy5kaWZmaWN1bHR5LmlkLCBhY3RpdmVGaWx0ZXJzLmRpZmZpY3VsdHkpICYmXG4gICAgICAgICAgICBzZWxmLmZpbHRlclRyZWtXaXRoSW50ZXJ2YWwodHJlay5wcm9wZXJ0aWVzLmR1cmF0aW9uLCBhY3RpdmVGaWx0ZXJzLmR1cmF0aW9uKSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrV2l0aEludGVydmFsKHRyZWsucHJvcGVydGllcy5hc2NlbnQsIGFjdGl2ZUZpbHRlcnMuZWxldmF0aW9uKSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrRXF1YWxzKCh0cmVrLnRpbGVzICYmIHRyZWsudGlsZXMuaXNEb3dubG9hZGVkKSA/IDEgOiAwLCBhY3RpdmVGaWx0ZXJzLmRvd25sb2FkKSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrV2l0aFNlbGVjdCh0cmVrLnByb3BlcnRpZXMudGhlbWVzLCBhY3RpdmVGaWx0ZXJzLnRoZW1lLCAnaWQnKSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrV2l0aFNlbGVjdCh0cmVrLnByb3BlcnRpZXMudXNhZ2VzLCBhY3RpdmVGaWx0ZXJzLnVzZSwgJ2lkJykgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhTZWxlY3QodHJlay5wcm9wZXJ0aWVzLnJvdXRlLCBhY3RpdmVGaWx0ZXJzLnJvdXRlLCAnaWQnKSAmJlxuICAgICAgICAgICAgc2VsZi5maWx0ZXJUcmVrV2l0aFNlbGVjdCh0cmVrLnByb3BlcnRpZXMuZGlzdHJpY3RzLCBhY3RpdmVGaWx0ZXJzLnZhbGxleSwgJ2lkJykgJiZcbiAgICAgICAgICAgIHNlbGYuZmlsdGVyVHJla1dpdGhTZWxlY3QodHJlay5wcm9wZXJ0aWVzLmNpdGllcywgYWN0aXZlRmlsdGVycy5tdW5pY2lwYWxpdHksICdjb2RlJykpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJlZFRyZWtzLnB1c2godHJlayk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkVHJla3M7XG4gICAgfTtcblxuXG4gICAgLy8gUmVtb3ZlIGZpbHRlciBkdXBsaWNhdGVzIHRoYXQgaGF2ZSB0aGUgc2FtZSBcInZhbHVlXCJcbiAgICB0aGlzLnJlbW92ZUZpbHRlckR1cGxpY2F0ZXMgPSBmdW5jdGlvbihhcnJheSkge1xuXG4gICAgICAgIHZhciBkaWN0ID0ge30sIHJlc3VsdD1bXTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudFZhbHVlID0gYXJyYXlbaV0udmFsdWU7XG4gICAgICAgICAgICBkaWN0W2N1cnJlbnRWYWx1ZV0gPSBhcnJheVtpXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGljdEtleXMgPSBPYmplY3Qua2V5cyhkaWN0KTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGRpY3RLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChkaWN0W2RpY3RLZXlzW2ldXSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG5cbiAgICAvLyBTb3J0IGZpbHRlciB2YWx1ZXMgYnkgdGhlaXIgbmFtZVxuICAgIHRoaXMuc29ydEZpbHRlck5hbWVzID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgICAgYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICB2YXIgbmFtZUEgPSBhLm5hbWU7XG4gICAgICAgICAgICB2YXIgbmFtZUIgPSBiLm5hbWU7XG4gICAgICAgICAgICByZXR1cm4gKG5hbWVBIDwgbmFtZUIpID8gLTEgOiAobmFtZUEgPiBuYW1lQikgPyAxIDogMDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG5cbiAgICAvLyBTb3J0IGZpbHRlciB2YWx1ZXMgYnkgdGhlaXIgdmFsdWVcbiAgICB0aGlzLnNvcnRGaWx0ZXJWYWx1ZXMgPSBmdW5jdGlvbihhcnJheSkge1xuICAgICAgICBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZUEgPSBhLnZhbHVlO1xuICAgICAgICAgICAgdmFyIHZhbHVlQiA9IGIudmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gKHZhbHVlQSA8IHZhbHVlQikgPyAtMSA6ICh2YWx1ZUEgPiB2YWx1ZUIpID8gMSA6IDA7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBhcnJheTtcbiAgICB9O1xuXG4gICAgLy8gUG9zc2libGUgdmFsdWVzIHRoYXQgdXNlciBjYW4gc2VsZWN0IG9uIGZpbHRlciBzaWRlYmFyIG1lbnUuXG4gICAgLy8gU29tZSBhcmUgY29uc3RhbnRzIGRlZmluZWQgaW4gc2V0dGluZ3MgKGR1cmF0aW9ucywgZWxldmF0aW9ucyksXG4gICAgLy8gb3RoZXJzIGNvbWUgZnJvbSB0cmVrIHBvc3NpYmxlIHZhbHVlc1xuICAgIHRoaXMuZ2V0VHJla0ZpbHRlck9wdGlvbnMgPSBmdW5jdGlvbih0cmVrcykge1xuXG4gICAgICAgIHZhciB0cmVrVGhlbWVzID0gW10sXG4gICAgICAgICAgICB0cmVrVXNlcyA9IFtdLFxuICAgICAgICAgICAgdHJla1JvdXRlID0gW10sXG4gICAgICAgICAgICB0cmVrVmFsbGV5cyA9IFtdLFxuICAgICAgICAgICAgdHJla011bmljaXBhbGl0aWVzID0gW10sXG4gICAgICAgICAgICB0cmVrRGlmZmljdWx0aWVzID0gW107XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzLmZlYXR1cmVzLCBmdW5jdGlvbih0cmVrKSB7XG5cbiAgICAgICAgICAgIC8vIFRoZW1lcyBpbml0XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLnRoZW1lcywgZnVuY3Rpb24odGhlbWUpIHtcbiAgICAgICAgICAgICAgICB0cmVrVGhlbWVzLnB1c2goe3ZhbHVlOiB0aGVtZS5pZCwgbmFtZTogdGhlbWUubGFiZWx9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEaWZmdWx0aWVzIGluaXRcbiAgICAgICAgICAgIHZhciBkaWZmaWN1bHR5ID0gdHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHk7XG4gICAgICAgICAgICB0cmVrRGlmZmljdWx0aWVzLnB1c2goe3ZhbHVlOiBkaWZmaWN1bHR5LmlkLCBuYW1lOiBkaWZmaWN1bHR5LmxhYmVsLCBpY29uOiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChkaWZmaWN1bHR5LnBpY3RvZ3JhbSl9KTtcblxuICAgICAgICAgICAgLy8gVXNlcyBpbml0XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLnVzYWdlcywgZnVuY3Rpb24odXNhZ2UpIHtcbiAgICAgICAgICAgICAgICB0cmVrVXNlcy5wdXNoKHt2YWx1ZTogdXNhZ2UuaWQsIG5hbWU6IHVzYWdlLmxhYmVsfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gUm91dGUgaW5pdFxuICAgICAgICAgICAgdmFyIHJvdXRlID0gdHJlay5wcm9wZXJ0aWVzLnJvdXRlO1xuICAgICAgICAgICAgdHJla1JvdXRlLnB1c2goe3ZhbHVlOiByb3V0ZS5pZCwgbmFtZTogcm91dGUubGFiZWx9KTtcblxuICAgICAgICAgICAgLy8gVmFsbGV5cyBpbml0XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmRpc3RyaWN0cywgZnVuY3Rpb24oZGlzdHJpY3QpIHtcbiAgICAgICAgICAgICAgICB0cmVrVmFsbGV5cy5wdXNoKHt2YWx1ZTogZGlzdHJpY3QuaWQsIG5hbWU6IGRpc3RyaWN0Lm5hbWV9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBNdW5pY2lwYWxpdGllcyBpbml0XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmNpdGllcywgZnVuY3Rpb24oY2l0eSkge1xuICAgICAgICAgICAgICAgIHRyZWtNdW5pY2lwYWxpdGllcy5wdXNoKHt2YWx1ZTogY2l0eS5jb2RlLCBuYW1lOiBjaXR5Lm5hbWV9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBSZW1vdmluZyBwb3NzaWJsZSB2YWx1ZXMgZHVwbGljYXRlc1xuICAgICAgICB0cmVrVGhlbWVzID0gdGhpcy5yZW1vdmVGaWx0ZXJEdXBsaWNhdGVzKHRyZWtUaGVtZXMpO1xuICAgICAgICB0cmVrVXNlcyA9IHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrVXNlcyk7XG4gICAgICAgIHRyZWtSb3V0ZSA9IHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrUm91dGUpO1xuICAgICAgICB0cmVrVmFsbGV5cyA9IHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrVmFsbGV5cyk7XG4gICAgICAgIHRyZWtNdW5pY2lwYWxpdGllcyA9IHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrTXVuaWNpcGFsaXRpZXMpO1xuICAgICAgICB0cmVrRGlmZmljdWx0aWVzID0gIHRoaXMucmVtb3ZlRmlsdGVyRHVwbGljYXRlcyh0cmVrRGlmZmljdWx0aWVzKTtcblxuICAgICAgICAvLyBTb3J0IHZhbHVlcyBieSB0aGVpciBuYW1lXG4gICAgICAgIHRyZWtUaGVtZXMgPSB0aGlzLnNvcnRGaWx0ZXJOYW1lcyh0cmVrVGhlbWVzKTtcbiAgICAgICAgdHJla1VzZXMgPSB0aGlzLnNvcnRGaWx0ZXJOYW1lcyh0cmVrVXNlcyk7XG4gICAgICAgIHRyZWtSb3V0ZSA9IHRoaXMuc29ydEZpbHRlck5hbWVzKHRyZWtSb3V0ZSk7XG4gICAgICAgIHRyZWtWYWxsZXlzID0gdGhpcy5zb3J0RmlsdGVyTmFtZXModHJla1ZhbGxleXMpO1xuICAgICAgICB0cmVrTXVuaWNpcGFsaXRpZXMgPSB0aGlzLnNvcnRGaWx0ZXJOYW1lcyh0cmVrTXVuaWNpcGFsaXRpZXMpO1xuICAgICAgICB0cmVrRGlmZmljdWx0aWVzID0gdGhpcy5zb3J0RmlsdGVyVmFsdWVzKHRyZWtEaWZmaWN1bHRpZXMpO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBkaWZmaWN1bHRpZXMgOiB0cmVrRGlmZmljdWx0aWVzLFxuICAgICAgICAgICAgZHVyYXRpb25zIDogc2V0dGluZ3NGYWN0b3J5LmZpbHRlcnMuZHVyYXRpb25zLFxuICAgICAgICAgICAgZWxldmF0aW9ucyA6ICBzZXR0aW5nc0ZhY3RvcnkuZmlsdGVycy5lbGV2YXRpb25zLFxuICAgICAgICAgICAgZG93bmxvYWRzIDogW1xuICAgICAgICAgICAgICAgIHsgdmFsdWU6IDEsIG5hbWU6ICduYXZfdHJla19tYXAub2ZmbGluZScsIGljb246ICdpY29uX29mZmxpbmUuc3ZnJyB9XG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgdGhlbWVzIDogdHJla1RoZW1lcyxcbiAgICAgICAgICAgIHVzZXM6IHRyZWtVc2VzLFxuICAgICAgICAgICAgcm91dGVzOiB0cmVrUm91dGUsXG4gICAgICAgICAgICB2YWxsZXlzOiB0cmVrVmFsbGV5cyxcbiAgICAgICAgICAgIG11bmljaXBhbGl0aWVzOiB0cmVrTXVuaWNpcGFsaXRpZXNcbiAgICAgICAgfVxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGZpbHRlcnNTZXJ2aWNlIDogZmlsdGVyc1NlcnZpY2Vcbn0iLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIExheW91dENvbnRyb2xsZXIoKSB7XG5cbn1cblxuZnVuY3Rpb24gSGVhZGVyQ29udHJvbGxlcigpIHtcbn1cblxuZnVuY3Rpb24gU2lkZWJhckNvbnRyb2xsZXIoKSB7XG59XG5cbmZ1bmN0aW9uIEZvb3RlckNvbnRyb2xsZXIoKSB7XG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgTGF5b3V0Q29udHJvbGxlcjogTGF5b3V0Q29udHJvbGxlcixcbiAgICBIZWFkZXJDb250cm9sbGVyOiBIZWFkZXJDb250cm9sbGVyLFxuICAgIFNpZGViYXJDb250cm9sbGVyOiBTaWRlYmFyQ29udHJvbGxlcixcbiAgICBGb290ZXJDb250cm9sbGVyOiBGb290ZXJDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLmxheW91dCcsIFsndWkucm91dGVyJywgJ3JhbmRvLnRyZWtzJ10pXG4gICAgLmNvbmZpZyhyZXF1aXJlKCcuL3JvdXRlcycpLmxheW91dFJvdXRlcylcbiAgICAucnVuKHJlcXVpcmUoJy4vc2VydmljZXMnKS5SdW5BcHApOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXIgPSByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJyk7XG5cbmZ1bmN0aW9uIGxheW91dFJvdXRlcygkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG5cbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2xheW91dCcsIHtcbiAgICAgICAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2xheW91dC5odG1sJyksXG4gICAgICAgICAgICBjb250cm9sbGVyOiBjb250cm9sbGVyLkxheW91dENvbnRyb2xsZXJcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdyb290Jywge1xuICAgICAgICAgICAgcGFyZW50OiAnbGF5b3V0JyxcbiAgICAgICAgICAgIHVybDogJy8nLFxuICAgICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgICAnaGVhZGVyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2hlYWRlci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuSGVhZGVyQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ3NpZGViYXInIDoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi90ZW1wbGF0ZXMvc2lkZWJhci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuU2lkZWJhckNvbnRyb2xsZXJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdjb250ZW50JyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2NvbnRlbnQtaG9tZS5odG1sJyksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnZm9vdGVyJyA6IHtcbiAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL2Zvb3Rlci5odG1sJyksXG4gICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXIuRm9vdGVyQ29udHJvbGxlclxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGxheW91dFJvdXRlczogbGF5b3V0Um91dGVzXG59OyIsIid1c2Ugc3RyaWN0JztcblxuXG5mdW5jdGlvbiBSdW5BcHAoKSB7XG4gICAgY29uc29sZS5sb2coJ2FwcCBzdGFydGVkJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIFJ1bkFwcDogUnVuQXBwXG59OyIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJyZXN1bHRzLWRyYXdlclwiPlxcbiAgICA8dHJla3MtbGlzdGU+PC90cmVrcy1saXN0ZT4gICAgXFxuPC9kaXY+XFxuPGdlb3RyZWstbWFwPjwvZ2VvdHJlay1tYXA+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XFxuXFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCIgcm9sZT1cIm5hdmlnYXRpb25cIj5cXG4gICAgPGRpdiBpZD1cImxvZ29cIj5Mb2dvPC9kaXY+XFxuPC9kaXY+JzsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8ZGl2IGlkPVwiaGVhZGVyXCIgdWktdmlldz1cImhlYWRlclwiPjwvZGl2PlxcbjxkaXYgaWQ9XCJtYWluLWNvbnRlbnRcIiBjbGFzcz1cImZsdWlkLWNvdGFpbmVyXCI+XFxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cXG4gICAgICAgIDxkaXYgaWQ9XCJzaWRlYmFyXCIgdWktdmlldz1cInNpZGViYXJcIiBjbGFzcz1cImNvbC1zbS0xXCI+PC9kaXY+XFxuICAgICAgICA8ZGl2IHVpLXZpZXc9XCJjb250ZW50XCIgY2xhc3M9XCJjb2wtc20tMTEgY29udGVudFwiPjwvZGl2PlxcbiAgICA8L2Rpdj5cXG48L2Rpdj5cXG48ZGl2IGlkPVwiZm9vdGVyXCIgdWktdmlldz1cImZvb3RlclwiPjwvZGl2Pic7IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdj5cXG48L2Rpdj4nOyIsIid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gTWFwQ29udHJvbGxlcigkc2NvcGUsIHNldHRpbmdzRmFjdG9yeSwgbWFwU2VydmljZSwgaWNvbnNTZXJ2aWNlLCB0cmVrc1NlcnZpY2UpIHtcbiAgICBcbiAgICB2YXIgbWFwO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlVHJla3MoY2FsbGJhY2spIHtcbiAgICAgICAgdHJla3NTZXJ2aWNlLmdldFRyZWtzKClcbiAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyZWtzID0gZGF0YTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2sgJiYgdHlwZW9mIGNhbGxiYWNrWzBdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrWzBdKGNhbGxiYWNrWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFwSW5pdChwYXJhbWV0ZXJzKSB7XG5cbiAgICAgICAgdmFyIG1hcFNlbGVjdG9yID0gcGFyYW1ldGVyc1swXSB8fCAnbWFwJztcblxuICAgICAgICBtYXAgPSBtYXBTZXJ2aWNlLmluaXRNYXAobWFwU2VsZWN0b3IpO1xuXG4gICAgICAgIC8vIExvYWQgdHJla3MgaW4gbWFwXG4gICAgICAgIG1hcFNlcnZpY2UuZGlzcGxheVRyZWtzKCRzY29wZS50cmVrcy5mZWF0dXJlcyk7XG5cbiAgICB9XG5cbiAgICB1cGRhdGVUcmVrcyhbbWFwSW5pdCxbJ21hcCddXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIE1hcENvbnRyb2xsZXIgOiBNYXBDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiBtYXBEaXJlY3RpdmUoKSB7XG4gICAgY29uc29sZS5sb2coJ21hcCBsb2FkaW5nJyk7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6IHJlcXVpcmUoJy4vdGVtcGxhdGVzL21hcC5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLk1hcENvbnRyb2xsZXJcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBtYXBEaXJlY3RpdmU6IG1hcERpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLm1hcCcsIFtdKVxuICAgIC5zZXJ2aWNlKCdtYXBTZXJ2aWNlJywgcmVxdWlyZSgnLi9zZXJ2aWNlcycpLm1hcFNlcnZpY2UpXG4gICAgLnNlcnZpY2UoJ2ljb25zU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS5pY29uc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ01hcENvbnRyb2xsZXInLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzJykuTWFwQ29udHJvbGxlcilcbiAgICAuZGlyZWN0aXZlKCdnZW90cmVrTWFwJywgcmVxdWlyZSgnLi9kaXJlY3RpdmVzJykubWFwRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG1hcFNlcnZpY2UoJHEsIHNldHRpbmdzRmFjdG9yeSwgdHJla3NTZXJ2aWNlLCBpY29uc1NlcnZpY2UpIHtcblxuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHRoaXMuaW5pdE1hcCA9IGZ1bmN0aW9uIChtYXBTZWxlY3Rvcikge1xuXG4gICAgICAgIC8vIFNldCBiYWNrZ3JvdW5kIExheWVyc1xuICAgICAgICB0aGlzLl9iYXNlTGF5ZXJzID0ge1xuICAgICAgICAgICAgbWFpbjogTC50aWxlTGF5ZXIoXG4gICAgICAgICAgICAgICAgc2V0dGluZ3NGYWN0b3J5Lk1BSU5fTEVBRkxFVF9CQUNLR1JPVU5ELkxBWUVSX1VSTCxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiAnbWFpbicsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0aW9uOiBzZXR0aW5nc0ZhY3RvcnkuTUFJTl9MRUFGTEVUX0JBQ0tHUk9VTkQuQVRUUklCVVRJT05cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgc2F0ZWxsaXRlOiBMLnRpbGVMYXllcihcbiAgICAgICAgICAgICAgICBzZXR0aW5nc0ZhY3RvcnkuU0FURUxMSVRFX0xFQUZMRVRfQkFDS0dST1VORC5MQVlFUl9VUkwsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBpZDogJ3NhdGVsbGl0ZScsXG4gICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0aW9uOiBzZXR0aW5nc0ZhY3RvcnkuU0FURUxMSVRFX0xFQUZMRVRfQkFDS0dST1VORC5BVFRSSUJVVElPTlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIClcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbWFwUGFyYW1ldGVycyA9IHtcbiAgICAgICAgICAgIGNlbnRlcjogW3NldHRpbmdzRmFjdG9yeS5MRUFGTEVUX0NPTkYuQ0VOVEVSX0xBVElUVURFLCBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkNFTlRFUl9MT05HSVRVREVdLFxuICAgICAgICAgICAgem9vbTogc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5ERUZBVUxUX1pPT00sXG4gICAgICAgICAgICBtaW5ab29tOiBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkRFRkFVTFRfTUlOX1pPT00sXG4gICAgICAgICAgICBtYXhab29tOiBzZXR0aW5nc0ZhY3RvcnkuTEVBRkxFVF9DT05GLkRFRkFVTFRfTUFYX1pPT00sXG4gICAgICAgICAgICBzY3JvbGxXaGVlbFpvb206IHRydWUsXG4gICAgICAgICAgICBsYXllcnM6IHRoaXMuX2Jhc2VMYXllcnMubWFpblxuICAgICAgICB9O1xuXG4gICAgICAgIC8vTWl4aW5zIGZvciBtYXBcbiAgICAgICAgdGhpcy5pbml0Q3VzdG9tc01peGlucygpO1xuXG4gICAgICAgIHRoaXMuX21hcCA9IEwubWFwKG1hcFNlbGVjdG9yLCBtYXBQYXJhbWV0ZXJzKTtcblxuICAgICAgICAvLyBTZXQtdXAgbWFwcyBjb250cm9scyAobmVlZHMgX21hcCB0byBiZSBkZWZpbmVkKTtcbiAgICAgICAgdGhpcy5pbml0TWFwQ29udHJvbHMoKTtcblxuICAgICAgICB0aGlzLmNyZWF0ZVRyZWtzTGF5ZXIoKTtcblxuICAgICAgICByZXR1cm4gbWFwO1xuICAgIH07XG5cbiAgICB0aGlzLmNyZWF0ZVRyZWtzTGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgdGhpcy5fdHJla3NMYXllciA9IG5ldyBMLk1hcmtlckNsdXN0ZXJHcm91cCh7XG4gICAgICAgICAgICBzaG93Q292ZXJhZ2VPbkhvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgIGljb25DcmVhdGVGdW5jdGlvbjogZnVuY3Rpb24oY2x1c3Rlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBpY29uc1NlcnZpY2UuZ2V0Q2x1c3Rlckljb24oY2x1c3Rlcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuICAgIC8vIEFkZCB0cmVrcyBnZW9qc29uIHRvIHRoZSBtYXBcbiAgICB0aGlzLmRpc3BsYXlUcmVrcyA9IGZ1bmN0aW9uICh0cmVrQ29sbGVjdGlvbikge1xuICAgICAgICAvLyBSZW1vdmUgYWxsIG1hcmtlcnMgc28gdGhlIGRpc3BsYXllZCBtYXJrZXJzIGNhbiBmaXQgdGhlIHNlYXJjaCByZXN1bHRzXG4gICAgICAgIHRoaXMuX3RyZWtzTGF5ZXIuY2xlYXJMYXllcnMoKTtcblxuICAgICAgICAvLyRzY29wZS5tYXBTZXJ2aWNlID0gbWFwU2VydmljZTtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtDb2xsZWN0aW9uLCBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgICAgICB2YXIgdHJla0RlcGFydHVyZSA9IHNlbGYuY3JlYXRlQ2x1c3Rlck1hcmtlckZyb21UcmVrKHRyZWspO1xuICAgICAgICAgICAgdHJla0RlcGFydHVyZS5vbih7XG4gICAgICAgICAgICAgICAgY2xpY2s6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ21hcmtlciBDbGlja2VkJyk7XG4gICAgICAgICAgICAgICAgICAgIC8vJHN0YXRlLmdvKFwiaG9tZS5tYXAuZGV0YWlsXCIsIHsgdHJla0lkOiB0cmVrLmlkIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2VsZi5fdHJla3NMYXllci5hZGRMYXllcih0cmVrRGVwYXJ0dXJlKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX21hcC5hZGRMYXllcih0aGlzLl90cmVrc0xheWVyKTtcblxuICAgICAgICAvKmlmICgodXBkYXRlQm91bmRzID09IHVuZGVmaW5lZCkgfHwgKHVwZGF0ZUJvdW5kcyA9PSB0cnVlKSkgeyAgICBcbiAgICAgICAgICAgIHRoaXMuX21hcC5maXRCb3VuZHModGhpcy5fdHJla3NMYXllci5nZXRCb3VuZHMoKSk7XG4gICAgICAgIH0qL1xuICAgIH07XG5cbiAgICAvLyBNQVJLRVJTIEFORCBDTFVTVEVSUyAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy9cbiAgICAvL1xuICAgIHZhciBfbWFya2VycyA9IFtdO1xuXG4gICAgdGhpcy5nZXRNYXJrZXJzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gX21hcmtlcnM7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0TWFya2VycyA9IGZ1bmN0aW9uIChtYXJrZXJzKSB7XG4gICAgICAgIF9tYXJrZXJzID0gbWFya2VycztcbiAgICB9O1xuXG4gICAgdGhpcy5jcmVhdGVNYXJrZXJzRnJvbVRyZWsgPSBmdW5jdGlvbiAodHJlaywgcG9pcykge1xuICAgICAgICB2YXIgbWFya2VycyA9IFtdO1xuXG4gICAgICAgIHZhciBzdGFydFBvaW50ID0gdHJla3NTZXJ2aWNlLmdldFN0YXJ0UG9pbnQodHJlayk7XG4gICAgICAgIHZhciBlbmRQb2ludCA9IHRyZWtzU2VydmljZS5nZXRFbmRQb2ludCh0cmVrKTtcbiAgICAgICAgdmFyIHBhcmtpbmdQb2ludCA9IHRyZWtzU2VydmljZS5nZXRQYXJraW5nUG9pbnQodHJlayk7XG5cbiAgICAgICAgbWFya2Vycy5wdXNoKEwubWFya2VyKFtlbmRQb2ludC5sYXQsIGVuZFBvaW50LmxuZ10sIHtcbiAgICAgICAgICAgIGljb246IGljb25zU2VydmljZS5nZXRBcnJpdmFsSWNvbigpLFxuICAgICAgICAgICAgbmFtZTogdHJlay5wcm9wZXJ0aWVzLmFycml2YWwsXG4gICAgICAgIH0pKTtcblxuICAgICAgICBtYXJrZXJzLnB1c2goTC5tYXJrZXIoW3N0YXJ0UG9pbnQubGF0LCBzdGFydFBvaW50LmxuZ10sIHtcbiAgICAgICAgICAgIGljb246IGljb25zU2VydmljZS5nZXREZXBhcnR1cmVJY29uKCksXG4gICAgICAgICAgICBuYW1lOiB0cmVrLnByb3BlcnRpZXMuZGVwYXJ0dXJlLFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgaWYocGFya2luZ1BvaW50KSB7XG4gICAgICAgICAgICBtYXJrZXJzLnB1c2goTC5tYXJrZXIoW3BhcmtpbmdQb2ludC5sYXQsIHBhcmtpbmdQb2ludC5sbmddLCB7XG4gICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0UGFya2luZ0ljb24oKSxcbiAgICAgICAgICAgIG5hbWU6IFwiUGFya2luZ1wiLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHRyZWsucHJvcGVydGllcy5hZHZpc2VkX3BhcmtpbmcsXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGluZm9ybWF0aW9uQ291bnQgPSAwO1xuICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmluZm9ybWF0aW9uX2Rlc2tzLCBmdW5jdGlvbiAoaW5mb3JtYXRpb24pIHtcbiAgICAgICAgICAgIHZhciBpbmZvcm1hdGlvbkRlc2NyaXB0aW9uID0gXCI8cD5cIiArIGluZm9ybWF0aW9uLmRlc2NyaXB0aW9uICsgXCI8L3A+XCJcbiAgICAgICAgICAgICAgICArIFwiPHA+XCIgKyBpbmZvcm1hdGlvbi5zdHJlZXQgKyBcIjwvcD5cIlxuICAgICAgICAgICAgICAgICsgXCI8cD5cIiArIGluZm9ybWF0aW9uLnBvc3RhbF9jb2RlICsgXCIgXCIgKyBpbmZvcm1hdGlvbi5tdW5pY2lwYWxpdHkgKyBcIjwvcD5cIlxuICAgICAgICAgICAgICAgICsgXCI8cD48YSBocmVmPSdcIiArIGluZm9ybWF0aW9uLndlYnNpdGUgKyBcIic+V2ViPC9hPiAtIDxhIGhyZWY9J3RlbDpcIiArIGluZm9ybWF0aW9uLnBob25lICsgXCInPlwiICsgaW5mb3JtYXRpb24ucGhvbmUgKyBcIjwvYT48L3A+XCI7XG5cbiAgICAgICAgICAgIG1hcmtlcnMucHVzaChMLm1hcmtlcihbaW5mb3JtYXRpb24ubGF0aXR1ZGUsIGluZm9ybWF0aW9uLmxvbmdpdHVkZV0sIHtcbiAgICAgICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0SW5mb3JtYXRpb25JY29uKCksXG4gICAgICAgICAgICAgICAgbmFtZTogaW5mb3JtYXRpb24ubmFtZSxcbiAgICAgICAgICAgICAgICB0aHVtYm5haWw6IGluZm9ybWF0aW9uLnBob3RvX3VybCxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogaW5mb3JtYXRpb25EZXNjcmlwdGlvbixcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGluZm9ybWF0aW9uQ291bnQgKz0gMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHBvaXMsIGZ1bmN0aW9uIChwb2kpIHtcbiAgICAgICAgICAgIHZhciBwb2lDb29yZHMgPSB7XG4gICAgICAgICAgICAgICAgJ2xhdCc6IHBvaS5nZW9tZXRyeS5jb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogcG9pLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHBvaUljb24gPSBpY29uc1NlcnZpY2UuZ2V0UE9JSWNvbihwb2kpO1xuICAgICAgICAgICAgbWFya2Vycy5wdXNoKEwubWFya2VyKFtwb2lDb29yZHMubGF0LCBwb2lDb29yZHMubG5nXSwge1xuICAgICAgICAgICAgICAgIGljb246IHBvaUljb24sXG4gICAgICAgICAgICAgICAgbmFtZTogcG9pLnByb3BlcnRpZXMubmFtZSxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogcG9pLnByb3BlcnRpZXMuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgICAgdGh1bWJuYWlsOiBwb2kucHJvcGVydGllcy50aHVtYm5haWwsXG4gICAgICAgICAgICAgICAgaW1nOiBwb2kucHJvcGVydGllcy5waWN0dXJlc1swXSxcbiAgICAgICAgICAgICAgICBwaWN0b2dyYW06IHBvaS5wcm9wZXJ0aWVzLnR5cGUucGljdG9ncmFtXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBtYXJrZXJzO1xuICAgIH07XG5cbiAgICB0aGlzLmNyZWF0ZUNsdXN0ZXJNYXJrZXJGcm9tVHJlayA9IGZ1bmN0aW9uICh0cmVrKSB7XG4gICAgICAgIHZhciBzdGFydFBvaW50ID0gdHJla3NTZXJ2aWNlLmdldFN0YXJ0UG9pbnQodHJlayk7XG5cbiAgICAgICAgdmFyIG1hcmtlciA9IEwubWFya2VyKFtzdGFydFBvaW50LmxhdCwgc3RhcnRQb2ludC5sbmddLCB7XG4gICAgICAgICAgICBpY29uOiBpY29uc1NlcnZpY2UuZ2V0VHJla0ljb24oKVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbWFya2VyO1xuICAgIH07XG5cblxuICAgIC8vIFVJIENPTlRST0xTIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vXG4gICAgLy9cblxuICAgIHRoaXMuaW5pdE1hcENvbnRyb2xzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnNldFNjYWxlKCk7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRpb24oKTtcbiAgICAgICAgdGhpcy5zZXRab29tQ29udHJvbFBvc2l0aW9uKCk7XG4gICAgICAgIHRoaXMuc2V0RnVsbFNjcmVlbkNvbnRyb2xsKCk7XG4gICAgICAgIHRoaXMuY3JlYXRlU2F0ZWxsaXRlVmlldygpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0U2NhbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEwuY29udHJvbC5zY2FsZSh7aW1wZXJpYWw6IGZhbHNlfSkuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRab29tQ29udHJvbFBvc2l0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9tYXAuem9vbUNvbnRyb2wuc2V0UG9zaXRpb24oJ3RvcHJpZ2h0Jyk7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0RnVsbFNjcmVlbkNvbnRyb2xsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBMLmNvbnRyb2wuZnVsbHNjcmVlbih7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ3RvcHJpZ2h0JyxcbiAgICAgICAgICAgIHRpdGxlOiAnRnVsbHNjcmVlbidcbiAgICAgICAgfSkuYWRkVG8odGhpcy5fbWFwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXRBdHRyaWJ1dGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fbWFwLmF0dHJpYnV0aW9uQ29udHJvbC5zZXRQcmVmaXgoc2V0dGluZ3NGYWN0b3J5LkxFQUZMRVRfQ09ORi5BVFRSSUJVVElPTik7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0UG9zaXRpb25NYXJrZXIgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgLy8gUHVsc2luZyBtYXJrZXIgaW5zcGlyZWQgYnlcbiAgICAgICAgLy8gaHR0cDovL2Jsb2cudGhlbWF0aWNtYXBwaW5nLm9yZy8yMDE0LzA2L3JlYWwtdGltZS10cmFja2luZy13aXRoLXNwb3QtYW5kLWxlYWZldC5odG1sXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgICAgICBjb2xvcjogJ2JsYWNrJyxcbiAgICAgICAgICAgIGZpbGxDb2xvcjogJyM5ODFkOTcnLFxuICAgICAgICAgICAgZmlsbE9wYWNpdHk6IDEsXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlTWFya2VyJyxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ2xlYWZsZXQtbGl2ZS11c2VyJyxcbiAgICAgICAgICAgIHdlaWdodDogMlxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuY3JlYXRlU2F0ZWxsaXRlVmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTC5Db250cm9sLlN3aXRjaEJhY2tncm91bmRMYXllcnMgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICAgICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogJ2JvdHRvbWxlZnQnLFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zd2l0Y2hfZGV0YWlsX3pvb20gPSAkKG1hcC5fY29udGFpbmVyKS5kYXRhKCdzd2l0Y2gtZGV0YWlsLXpvb20nKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zd2l0Y2hfZGV0YWlsX3pvb20gPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5vbignem9vbWVuZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwLmlzU2hvd2luZ0xheWVyKCdzYXRlbGxpdGUnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZS50YXJnZXQuZ2V0Wm9vbSgpID4gdGhpcy5zd2l0Y2hfZGV0YWlsX3pvb20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1hcC5pc1Nob3dpbmdMYXllcignZGV0YWlsJykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyBtYXAuc3dpdGNoTGF5ZXIoJ2RldGFpbCcpOyB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXAuaXNTaG93aW5nTGF5ZXIoJ21haW4nKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IG1hcC5zd2l0Y2hMYXllcignbWFpbicpOyB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2ltcGxlLWxheWVyLXN3aXRjaGVyJyk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2xhc3NOYW1lID0gJ3RvZ2dsZS1sYXllciBiYWNrZ3JvdW5kIHNhdGVsbGl0ZSc7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbiA9IEwuRG9tVXRpbC5jcmVhdGUoJ2EnLCBjbGFzc05hbWUsIHRoaXMuX2NvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QXR0cmlidXRlKCd0aXRsZScsICdTaG93IHNhdGVsbGl0ZScpO1xuICAgICAgICAgICAgICAgICQodGhpcy5idXR0b24pLnRvb2x0aXAoe3BsYWNlbWVudDogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6IG1hcC5fY29udGFpbmVyfSk7XG5cbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50LmRpc2FibGVDbGlja1Byb3BhZ2F0aW9uKHRoaXMuYnV0dG9uKTtcbiAgICAgICAgICAgICAgICBMLkRvbUV2ZW50Lm9uKHRoaXMuYnV0dG9uLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxheWVyKCk7XG4gICAgICAgICAgICAgICAgfSwgdGhpcyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdG9nZ2xlTGF5ZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tYXAuaXNTaG93aW5nTGF5ZXIoJ21haW4nKSB8fCB0aGlzLm1hcC5pc1Nob3dpbmdMYXllcignZGV0YWlsJykpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc3dpdGNoTGF5ZXIoJ3NhdGVsbGl0ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgIEwuRG9tVXRpbC5yZW1vdmVDbGFzcyh0aGlzLmJ1dHRvbiwgJ3NhdGVsbGl0ZScpO1xuICAgICAgICAgICAgICAgICAgICBMLkRvbVV0aWwuYWRkQ2xhc3ModGhpcy5idXR0b24sICdtYWluJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEF0dHJpYnV0ZSgndGl0bGUnLCAnU2hvdyBwbGFuJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zd2l0Y2hMYXllcih0aGlzLm1hcC5nZXRab29tKCkgPiB0aGlzLnN3aXRjaF9kZXRhaWxfem9vbSA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdkZXRhaWwnIDogJ21haW4nKTtcblxuICAgICAgICAgICAgICAgICAgICBMLkRvbVV0aWwucmVtb3ZlQ2xhc3ModGhpcy5idXR0b24sICdtYWluJyk7XG4gICAgICAgICAgICAgICAgICAgIEwuRG9tVXRpbC5hZGRDbGFzcyh0aGlzLmJ1dHRvbiwgJ3NhdGVsbGl0ZScpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBdHRyaWJ1dGUoJ3RpdGxlJywgJ1Nob3cgc2F0ZWxsaXRlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCh0aGlzLmJ1dHRvbikudG9vbHRpcCgnZGVzdHJveScpO1xuICAgICAgICAgICAgICAgICQodGhpcy5idXR0b24pLnRvb2x0aXAoe3BsYWNlbWVudDogJ3JpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXI6IHRoaXMubWFwLl9jb250YWluZXJ9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgc3dpdGNoQ29udHJvbCA9IG5ldyBMLkNvbnRyb2wuU3dpdGNoQmFja2dyb3VuZExheWVycygpO1xuICAgICAgICAgICAgc3dpdGNoQ29udHJvbC5hZGRUbyh0aGlzLl9tYXApO1xuICAgIH07XG5cblxuICAgIC8vIENVU1RPTSBNSVhJTlMgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy9cbiAgICAvL1xuICAgIHRoaXMuaW5pdEN1c3RvbXNNaXhpbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYWRkTWFwTGF5ZXJzTWl4aW4oKTtcbiAgICAgICAgdGhpcy50b3BQYWRkaW5nKCk7XG4gICAgICAgIHRoaXMuYWRkRmFrZUJvdW5kc01peGluKCk7XG4gICAgICAgIC8vdGhpcy50b2dnbGVQb2lMYXllcigpO1xuICAgIH1cblxuICAgIHRoaXMuYWRkTWFwTGF5ZXJzTWl4aW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBMYXllclN3aXRjaGVyTWl4aW4gPSB7XG5cbiAgICAgICAgICAgIGlzU2hvd2luZ0xheWVyOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmhhc0xheWVyKHNlbGYuX2Jhc2VMYXllcnNbbmFtZV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBzd2l0Y2hMYXllcjogZnVuY3Rpb24gKGRlc3RMYXllcikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGJhc2UgaW4gc2VsZi5fYmFzZUxheWVycykgeyBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzTGF5ZXIoc2VsZi5fYmFzZUxheWVyc1tiYXNlXSkgJiYgc2VsZi5fYmFzZUxheWVyc1tiYXNlXSAhPSBzZWxmLl9iYXNlTGF5ZXJzW2Rlc3RMYXllcl0pIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxheWVyKHNlbGYuX2Jhc2VMYXllcnNbYmFzZV0pOyBcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmFkZExheWVyKHNlbGYuX2Jhc2VMYXllcnNbZGVzdExheWVyXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgTC5NYXAuaW5jbHVkZShMYXllclN3aXRjaGVyTWl4aW4pO1xuICAgIH1cblxuICAgIHRoaXMudG9wUGFkZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTC5MYXRMbmdCb3VuZHMucHJvdG90eXBlLnBhZFRvcCA9IGZ1bmN0aW9uIChidWZmZXJSYXRpbykge1xuICAgICAgICAgICAgdmFyIHN3ID0gdGhpcy5fc291dGhXZXN0LFxuICAgICAgICAgICAgICAgIG5lID0gdGhpcy5fbm9ydGhFYXN0LFxuICAgICAgICAgICAgICAgIGhlaWdodEJ1ZmZlciA9IE1hdGguYWJzKHN3LmxhdCAtIG5lLmxhdCkgKiBidWZmZXJSYXRpbztcblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBMLkxhdExuZ0JvdW5kcyhcbiAgICAgICAgICAgICAgICAgICAgbmV3IEwuTGF0TG5nKHN3LmxhdCwgc3cubG5nKSxcbiAgICAgICAgICAgICAgICAgICAgbmV3IEwuTGF0TG5nKG5lLmxhdCArIGhlaWdodEJ1ZmZlciwgbmUubG5nKSk7XG5cbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRGYWtlQm91bmRzTWl4aW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBGYWtlQm91bmRzTWFwTWl4aW4gPSB7XG4gICAgICAgICAgICBfX2Zha2VCb3VuZHM6IGZ1bmN0aW9uIChib3VuZHMpIHtcbiAgICAgICAgICAgICAgICAvKiBEZXBlbmRpbmcgb24gc2lkZWJhciBvcGVuL2Nsb3NlLCB3ZSBjb3JyZWN0IHRoZSBib3VuZHMgb2YgdGhlIG1hcFxuICAgICAgICAgICAgICAgIElmIGluaXQsIHdlIGluY3JlYXNlLCBlbHNlIHdlIHJlZHVjZS5cbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5fbG9hZGVkKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYm91bmRzO1xuXG4gICAgICAgICAgICAgICAgdmFyIG1hcEJvdW5kcyA9IHRoaXMuZ2V0Qm91bmRzKCksXG4gICAgICAgICAgICAgICAgICAgIGZyb20gPSBhcmd1bWVudHMubGVuZ3RoID09PSAwO1xuICAgICAgICAgICAgICAgIGJvdW5kcyA9IGZyb20gPyBtYXBCb3VuZHMgOiBib3VuZHM7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2xvc2VkID0gJCgnI3NpZGUtYmFyJykuaGFzQ2xhc3MoJ2Nsb3NlZCcpO1xuICAgICAgICAgICAgICAgIGlmIChjbG9zZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGJvdW5kcztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgc2lkZWJhclcgPSAkKCcjc2lkZS1iYXInKS5vdXRlcldpZHRoKCkgLyAkKCcjbWFpbm1hcCcpLndpZHRoKCksXG4gICAgICAgICAgICAgICAgICAgIGJvdW5kc3dpZHRoID0gbWFwQm91bmRzLmdldFNvdXRoRWFzdCgpLmxuZyAtIG1hcEJvdW5kcy5nZXRTb3V0aFdlc3QoKS5sbmcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IHNpZGViYXJXICogYm91bmRzd2lkdGggKiAoZnJvbSA/IDEgOiAtMSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgb2xkU291dGhXZXN0ID0gYm91bmRzLmdldFNvdXRoV2VzdCgpLFxuICAgICAgICAgICAgICAgICAgICBzb3V0aFdlc3QgPSBMLmxhdExuZyhvbGRTb3V0aFdlc3QubGF0LCBvbGRTb3V0aFdlc3QubG5nICsgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gTC5sYXRMbmdCb3VuZHMoc291dGhXZXN0LCBib3VuZHMuZ2V0Tm9ydGhFYXN0KCkpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZml0RmFrZUJvdW5kczogZnVuY3Rpb24gKGJvdW5kcykge1xuICAgICAgICAgICAgICAgIHRoaXMuZml0Qm91bmRzKGJvdW5kcyk7XG4gICAgICAgICAgICAgICAgdGhpcy53aGVuUmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpdEJvdW5kcyh0aGlzLl9fZmFrZUJvdW5kcyhib3VuZHMpKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGdldEZha2VCb3VuZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fX2Zha2VCb3VuZHMoKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGZha2VQYW5UbzogZnVuY3Rpb24gKGxhdGxuZykge1xuICAgICAgICAgICAgICAgIHZhciBib3VuZHMgPSBuZXcgTC5MYXRMbmdCb3VuZHMoW2xhdGxuZywgbGF0bG5nXSksXG4gICAgICAgICAgICAgICAgICAgIGZha2VCb3VuZHMgPSB0aGlzLl9fZmFrZUJvdW5kcyhib3VuZHMpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFuVG8oZmFrZUJvdW5kcy5nZXRDZW50ZXIoKSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBwYW5Ub09mZnNldDogZnVuY3Rpb24gKGxhdGxuZywgb2Zmc2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLmxhdExuZ1RvQ29udGFpbmVyUG9pbnQobGF0bG5nKS54IC0gb2Zmc2V0WzBdO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy5sYXRMbmdUb0NvbnRhaW5lclBvaW50KGxhdGxuZykueSAtIG9mZnNldFsxXTtcbiAgICAgICAgICAgICAgICB2YXIgcG9pbnQgPSB0aGlzLmNvbnRhaW5lclBvaW50VG9MYXRMbmcoW3gsIHldKTtcblxuICAgICAgICAgICAgICAgIHZhciBjdXJyZW50ID0gdGhpcy5sYXRMbmdUb0NvbnRhaW5lclBvaW50KHRoaXMuZ2V0Q2VudGVyKCkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKEwucG9pbnQoeCwgeSkuZGlzdGFuY2VUbyhjdXJyZW50KSA8IG9wdGlvbnMubWluaW11bURpc3RhbmNlKVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zZXRWaWV3KHBvaW50LCB0aGlzLl96b29tLCB7IHBhbjogb3B0aW9ucyB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIEwuTWFwLmluY2x1ZGUoRmFrZUJvdW5kc01hcE1peGluKTtcbiAgICB9XG5cbiAgICB0aGlzLnRvZ2dsZVBvaUxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBMLkNvbnRyb2wuVG9nZ2xlUE9JTGF5ZXIgPSBMLkNvbnRyb2wuZXh0ZW5kKHtcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgcG9zaXRpb246ICdib3R0b21sZWZ0JyxcbiAgICAgICAgfSxcblxuICAgICAgICBpbml0aWFsaXplOiBmdW5jdGlvbiAobGF5ZXIsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHRoaXMubGF5ZXIgPSBsYXllcjtcbiAgICAgICAgICAgIEwuQ29udHJvbC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5jYWxsKHRoaXMsIG9wdGlvbnMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uQWRkOiBmdW5jdGlvbihtYXApIHtcbiAgICAgICAgICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgICAgICAgICB0aGlzLl9jb250YWluZXIgPSBMLkRvbVV0aWwuY3JlYXRlKCdkaXYnLCAnc2ltcGxlLWxheWVyLXN3aXRjaGVyIHBvaXMnKTtcbiAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSAndG9nZ2xlLWxheWVyIHBvaXMgYWN0aXZlJztcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uID0gTC5Eb21VdGlsLmNyZWF0ZSgnYScsIGNsYXNzTmFtZSwgdGhpcy5fY29udGFpbmVyKTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEF0dHJpYnV0ZSgndGl0bGUnLCBnZXR0ZXh0KCdQb2ludHMgb2YgaW50ZXJlc3QnKSk7XG4gICAgICAgICAgICAkKHRoaXMuYnV0dG9uKS50b29sdGlwKHtwbGFjZW1lbnQ6ICdyaWdodCd9KTtcblxuICAgICAgICAgICAgTC5Eb21FdmVudC5kaXNhYmxlQ2xpY2tQcm9wYWdhdGlvbih0aGlzLmJ1dHRvbik7XG4gICAgICAgICAgICBMLkRvbUV2ZW50Lm9uKHRoaXMuYnV0dG9uLCAnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGF5ZXIoKTtcbiAgICAgICAgICAgIH0sIHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY29udGFpbmVyO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRvZ2dsZUxheWVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sYXllcikge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1hcC5oYXNMYXllcih0aGlzLmxheWVyKSkge1xuICAgICAgICAgICAgICAgICAgICAkKHdpbmRvdykudHJpZ2dlcigncG9pczpoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAgICAgTC5Eb21VdGlsLnJlbW92ZUNsYXNzKHRoaXMuYnV0dG9uLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ3BvaXM6c2hvd24nKTtcbiAgICAgICAgICAgICAgICAgICAgTC5Eb21VdGlsLmFkZENsYXNzKHRoaXMuYnV0dG9uLCAnYWN0aXZlJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHRoaXMubGF5ZXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSk7XG4gICAgfVxuXG59XG5cbmZ1bmN0aW9uIGljb25zU2VydmljZSgkd2luZG93KSB7XG5cbiAgICB2YXIgdHJla19pY29ucyA9IHtcbiAgICAgICAgZGVmYXVsdF9pY29uOiB7fSxcbiAgICAgICAgZGVwYXJ0dXJlX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL21hcmtlci1zb3VyY2UucG5nJyxcbiAgICAgICAgICAgIGljb25TaXplOiBbNjQsIDY0XSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFszMiwgNjRdLFxuICAgICAgICAgICAgbGFiZWxBbmNob3I6IFsyMCwgLTUwXVxuICAgICAgICB9KSxcbiAgICAgICAgYXJyaXZhbF9pY29uOiBMLmljb24oe1xuICAgICAgICAgICAgaWNvblVybDogJ2ltYWdlcy9tYXJrZXItdGFyZ2V0LnBuZycsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzY0LCA2NF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMzIsIDY0XSxcbiAgICAgICAgICAgIGxhYmVsQW5jaG9yOiBbMjAsIC01MF1cbiAgICAgICAgfSksXG4gICAgICAgIHBhcmtpbmdfaWNvbjogTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6ICdpbWFnZXMvcGFya2luZy5wbmcnLFxuICAgICAgICAgICAgaWNvblNpemU6IFszMiwgMzJdLFxuICAgICAgICAgICAgaWNvbkFuY2hvcjogWzE2LCAxNl1cbiAgICAgICAgfSksXG4gICAgICAgIGluZm9ybWF0aW9uX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uVXJsOiAnaW1hZ2VzL2luZm9ybWF0aW9uLnN2ZycsXG4gICAgICAgICAgICBpY29uU2l6ZTogWzMyLCAzMl0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMTYsIDE2XVxuICAgICAgICB9KSxcbiAgICAgICAgcG9pX2ljb246IEwuaWNvbih7XG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBsYWJlbEFuY2hvcjogWzIwLCAtNTBdXG4gICAgICAgIH0pLFxuICAgICAgICB0cmVrX2ljb246IEwuZGl2SWNvbih7XG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyZWstaWNvbicsXG4gICAgICAgICAgICBsYWJlbEFuY2hvcjogWzIwLCAwXVxuICAgICAgICB9KVxuICAgIH07XG5cbiAgICB0aGlzLmdldFBPSUljb24gPSBmdW5jdGlvbiAocG9pKSB7XG4gICAgICAgIHZhciBwaWN0b2dyYW1VcmwgPSBwb2kucHJvcGVydGllcy50eXBlLnBpY3RvZ3JhbTtcblxuICAgICAgICByZXR1cm4gTC5pY29uKHtcbiAgICAgICAgICAgIGljb25Vcmw6IHBpY3RvZ3JhbVVybCxcbiAgICAgICAgICAgIGljb25TaXplOiBbMzIsIDMyXSxcbiAgICAgICAgICAgIGljb25BbmNob3I6IFsxNiwgMTZdXG4gICAgICAgIH0pXG4gICAgfTtcblxuICAgIHRoaXMuZ2V0Q2x1c3Rlckljb24gPSBmdW5jdGlvbiAoY2x1c3Rlcikge1xuICAgICAgICByZXR1cm4gbmV3IEwuRGl2SWNvbih7XG4gICAgICAgICAgICBpY29uU2l6ZTogWzQwLCA0MF0sXG4gICAgICAgICAgICBpY29uQW5jaG9yOiBbMjAsIDIwXSxcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ3RyZWstY2x1c3RlcicsXG4gICAgICAgICAgICBodG1sOiAnPHNwYW4gY2xhc3M9XCJjb3VudFwiPicgKyBjbHVzdGVyLmdldENoaWxkQ291bnQoKSArICc8L3NwYW4+J1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXREZXBhcnR1cmVJY29uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5kZXBhcnR1cmVfaWNvbjtcbiAgICB9O1xuXG4gICAgdGhpcy5nZXRBcnJpdmFsSWNvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRyZWtfaWNvbnMuYXJyaXZhbF9pY29uO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFBhcmtpbmdJY29uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5wYXJraW5nX2ljb247XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0SW5mb3JtYXRpb25JY29uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy5pbmZvcm1hdGlvbl9pY29uO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtJY29uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJla19pY29ucy50cmVrX2ljb247XG4gICAgfTtcblxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIG1hcFNlcnZpY2U6IG1hcFNlcnZpY2UsXG4gICAgaWNvbnNTZXJ2aWNlOiBpY29uc1NlcnZpY2Vcbn07IiwibW9kdWxlLmV4cG9ydHMgPSAnPGRpdiBpZD1cIm1hcFwiPlxcblxcbjwvZGl2Pic7IiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBUcmVrc0xpc3RlQ29udHJvbGxlcigkc2NvcGUsIHRyZWtzU2VydmljZSkge1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlVHJla3MoKSB7XG4gICAgICAgIHRyZWtzU2VydmljZS5nZXRUcmVrcygpXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmVrcyA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgdXBkYXRlVHJla3MoKTtcbiAgICAgICAgXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgVHJla3NMaXN0ZUNvbnRyb2xsZXI6IFRyZWtzTGlzdGVDb250cm9sbGVyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnRyb2xsZXJzID0gcmVxdWlyZSgnLi9jb250cm9sbGVycycpO1xuXG5mdW5jdGlvbiB0cmVrc0xpc3RlRGlyZWN0aXZlKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHRlbXBsYXRlOiByZXF1aXJlKCcuL3RlbXBsYXRlcy90cmVrcy1saXN0ZS5odG1sJyksXG4gICAgICAgIGNvbnRyb2xsZXI6IGNvbnRyb2xsZXJzLlRyZWtzTGlzdGVDb250cm9sbGVyXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdHJla3NMaXN0ZURpcmVjdGl2ZTogdHJla3NMaXN0ZURpcmVjdGl2ZVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYW5ndWxhci5tb2R1bGUoJ3JhbmRvLnRyZWtzJywgW10pXG4gICAgLnNlcnZpY2UoJ3RyZWtzU2VydmljZScsIHJlcXVpcmUoJy4vc2VydmljZXMnKS50cmVrc1NlcnZpY2UpXG4gICAgLmNvbnRyb2xsZXIoJ1RyZWtzTGlzdGVDb250cm9sbGVyJywgcmVxdWlyZSgnLi9jb250cm9sbGVycycpLlRyZWtzTGlzdGVDb250cm9sbGVyKVxuICAgIC5kaXJlY3RpdmUoJ3RyZWtzTGlzdGUnLCByZXF1aXJlKCcuL2RpcmVjdGl2ZXMnKS50cmVrc0xpc3RlRGlyZWN0aXZlKTsiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIHRyZWtzU2VydmljZShzZXR0aW5nc0ZhY3RvcnksICRyZXNvdXJjZSwgJHEsIGZpbHRlcnNTZXJ2aWNlKSB7XG5cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICB0aGlzLmdldFN0YXJ0UG9pbnQgPSBmdW5jdGlvbih0cmVrKSB7XG4gICAgICAgIHZhciBmaXJzdFBvaW50Q29vcmRpbmF0ZXMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzWzBdO1xuXG4gICAgICAgIHJldHVybiB7J2xhdCc6IGZpcnN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogZmlyc3RQb2ludENvb3JkaW5hdGVzWzBdfVxuICAgIH07XG5cbiAgICB0aGlzLmdldEVuZFBvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgbmJQdHMgPSB0cmVrLmdlb21ldHJ5LmNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGxhc3RQb2ludENvb3JkaW5hdGVzID0gdHJlay5nZW9tZXRyeS5jb29yZGluYXRlc1tuYlB0cy0xXTtcblxuICAgICAgICByZXR1cm4geydsYXQnOiBsYXN0UG9pbnRDb29yZGluYXRlc1sxXSxcbiAgICAgICAgICAgICAgICAnbG5nJzogbGFzdFBvaW50Q29vcmRpbmF0ZXNbMF19XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0UGFya2luZ1BvaW50ID0gZnVuY3Rpb24odHJlaykge1xuICAgICAgICB2YXIgcGFya2luZ0Nvb3JkaW5hdGVzID0gdHJlay5wcm9wZXJ0aWVzLnBhcmtpbmdfbG9jYXRpb247XG5cbiAgICAgICAgcmV0dXJuIHBhcmtpbmdDb29yZGluYXRlcyA/IHsnbGF0JzogcGFya2luZ0Nvb3JkaW5hdGVzWzFdLFxuICAgICAgICAgICAgICAgICdsbmcnOiBwYXJraW5nQ29vcmRpbmF0ZXNbMF19IDogbnVsbFxuICAgIH07XG5cbiAgICB0aGlzLnJlcGxhY2VJbWdVUkxzID0gZnVuY3Rpb24gKHRyZWtzRGF0YSkgeyAgICAgICAgXG5cbiAgICAgICAgLy8gUGFyc2UgdHJlayBwaWN0dXJlcywgYW5kIGNoYW5nZSB0aGVpciBVUkxcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWtzRGF0YS5mZWF0dXJlcywgZnVuY3Rpb24odHJlaykge1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy5waWN0dXJlcywgZnVuY3Rpb24ocGljdHVyZSnCoHtcbiAgICAgICAgICAgICAgICBwaWN0dXJlLnVybCA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyBwaWN0dXJlLnVybDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyZWsucHJvcGVydGllcy51c2FnZXMsIGZ1bmN0aW9uKHVzYWdlKcKge1xuICAgICAgICAgICAgICAgIHVzYWdlLnBpY3RvZ3JhbSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB1c2FnZS5waWN0b2dyYW07XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmVrLnByb3BlcnRpZXMudGhlbWVzLCBmdW5jdGlvbih0aGVtZSnCoHtcbiAgICAgICAgICAgICAgICB0aGVtZS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdGhlbWUucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLm5ldHdvcmtzLCBmdW5jdGlvbihuZXR3b3JrKcKge1xuICAgICAgICAgICAgICAgIG5ldHdvcmsucGljdG9ncmFtID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIG5ldHdvcmsucGljdG9ncmFtO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godHJlay5wcm9wZXJ0aWVzLmluZm9ybWF0aW9uX2Rlc2tzLCBmdW5jdGlvbihpbmZvcm1hdGlvbl9kZXNrKcKge1xuICAgICAgICAgICAgICAgIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIGluZm9ybWF0aW9uX2Rlc2sucGhvdG9fdXJsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMudGh1bWJuYWlsID0gc2V0dGluZ3NGYWN0b3J5LkRPTUFJTiArIHRyZWsucHJvcGVydGllcy50aHVtYm5haWw7XG4gICAgICAgICAgICB0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5waWN0b2dyYW0gPSBzZXR0aW5nc0ZhY3RvcnkuRE9NQUlOICsgdHJlay5wcm9wZXJ0aWVzLmRpZmZpY3VsdHkucGljdG9ncmFtO1xuICAgICAgICAgICAgdHJlay5wcm9wZXJ0aWVzLmFsdGltZXRyaWNfcHJvZmlsZSA9IHNldHRpbmdzRmFjdG9yeS5ET01BSU4gKyB0cmVrLnByb3BlcnRpZXMuYWx0aW1ldHJpY19wcm9maWxlLnJlcGxhY2UoXCIuanNvblwiLCBcIi5zdmdcIik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJla3NEYXRhO1xuICAgIH07XG5cbiAgICB0aGlzLmdldFRyZWtzID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3RyZWtMaXN0KSB7XG5cbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc2VsZi5fdHJla0xpc3QpO1xuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdXJsID0gc2V0dGluZ3NGYWN0b3J5LnRyZWtzVXJsO1xuXG4gICAgICAgICAgICB2YXIgcmVxdWVzdHMgPSAkcmVzb3VyY2UodXJsLCB7fSwge1xuICAgICAgICAgICAgICAgIHF1ZXJ5OiB7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICAgICAgICAgIGNhY2hlOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RzLnF1ZXJ5KCkuJHByb21pc2VcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGFuZ3VsYXIuZnJvbUpzb24oZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjb252ZXJ0ZWRJbWdzID0gc2VsZi5yZXBsYWNlSW1nVVJMcyhkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fdHJla0xpc3QgPSBjb252ZXJ0ZWRJbWdzO1xuICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNvbnZlcnRlZEltZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcblxuICAgIH07XG5cbiAgICB0aGlzLmZpbHRlclRyZWtzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICAgIGZpbHRlcmVkVHJla3MgPSBmaWx0ZXJzU2VydmljZS5maWx0ZXJUcmVrcygpO1xuICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGZpbHRlcmVkVHJla3MpO1xuXG5cbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB0cmVrc1NlcnZpY2U6IHRyZWtzU2VydmljZVxufTsiLCJtb2R1bGUuZXhwb3J0cyA9ICc8c2VjdGlvbiBjbGFzcz1cInRyZWtzLWxpc3RlXCI+XFxuICAgIDxhcnRpY2xlIG5nLXJlcGVhdD1cInRyZWsgaW4gdHJla3MuZmVhdHVyZXNcIiBuZy1pZD1cInRyZWste3t0cmVrLmlkfX1cIiBjbGFzcz1cInRyZWsgY29sLXNtLTEyIGNvbC1tZC02XCI+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwidmlzdWFsXCI+XFxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZhdi1vci1ub3RcIj5cXG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWhlYXJ0XCI+PC9pPlxcbiAgICAgICAgICAgIDwvZGl2PlxcbiAgICAgICAgICAgIDxpbWcgbmctc3JjPVwie3t0cmVrLnByb3BlcnRpZXMucGljdHVyZXNbMF0udXJsfX1cIiBuZy1hbHQ9XCJ7e3RyZWsucHJvcGVydGllcy5waWN0dXJlc1swXS50aXRsZX19XCI+ICAgIFxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8aDEgY2xhc3M9XCJ0aXRsZVwiPnt7dHJlay5wcm9wZXJ0aWVzLm5hbWV9fTwvaDE+XFxuICAgICAgICA8ZGl2IGNsYXNzPVwiaW5mb3NcIj5cXG4gICAgICAgICAgICA8c3Bhbj57e3RyZWsucHJvcGVydGllcy5kaXN0cmljdHNbMF0ubmFtZX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLmR1cmF0aW9uX3ByZXR0eX19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPkTDqW5pdmVsw6kge3t0cmVrLnByb3BlcnRpZXMuYXNjZW50fX0gLSA8L3NwYW4+XFxuICAgICAgICAgICAgPHNwYW4+e3t0cmVrLnByb3BlcnRpZXMuZGlmZmljdWx0eS5sYWJlbH19IC0gPC9zcGFuPlxcbiAgICAgICAgICAgIDxzcGFuPnt7dHJlay5wcm9wZXJ0aWVzLnVzYWdlc1swXS5sYWJlbH19PC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuICAgICAgICA8dWwgY2xhc3M9XCJ0aGVtZXNcIj5cXG4gICAgICAgICAgICA8bGkgbmctcmVwZWF0PVwidGhlbWUgaW4gdHJlay5wcm9wZXJ0aWVzLnRoZW1lc1wiPlxcbiAgICAgICAgICAgICAgICA8aW1nIG5nLXNyYz1cInt7dGhlbWUucGljdG9ncmFtfX1cIiBuZy1hbHQ9XCJ7e3RoZW1lLmxhYmVsfX1cIj5cXG4gICAgICAgICAgICA8L2xpPlxcbiAgICAgICAgPC91bD5cXG4gICAgICAgIDxkaXYgY2xhc3M9XCJrbm93LW1vcmVcIj5cXG4gICAgICAgICAgICA8c3Bhbj4rPC9zcGFuPlxcbiAgICAgICAgPC9kaXY+XFxuXFxuICAgIDwvYXJ0aWNsZT5cXG48L3NlY3Rpb24+JzsiXX0=
