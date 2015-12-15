'use strict';

function WarningService(translationService, settingsFactory, $resource, $http, $q) {
    var that = this;

    that.getWarningCategories = function (forceRefresh) {
        var deferred = $q.defer();

        if (that._warningCategories && !forceRefresh) {

            deferred.resolve(that._warningCategories);

        } else {
            var lang = translationService.getCurrentLang();
            if (lang.code) {
                lang = lang.code;
            }
            var url = settingsFactory.warningCategoriesUrl.replace(/\$lang/, lang);
            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (data) {
                    var categories = angular.fromJson(data);
                    that._warningCategories = categories;
                    deferred.resolve(categories);
                });

        }

        return deferred.promise;
    };

    that.sendWarning = function (formData) {

        var lang = translationService.getCurrentLang();
        if (lang.code) {
            lang = lang.code;
        }
        var url = settingsFactory.warningSubmitUrl.replace(/\$lang/, lang);

        return $http({
            method: 'POST',
            url: url,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj) {
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            data: {
                name: formData.name,
                email: formData.email,
                category: formData.category,
                comment: formData.comment,
                geom: '{"type": "Point", "coordinates": [' + formData.location.lng + ',' + formData.location.lat + ']}'
            }
        });
    };
}

function WarningMapService(globalSettings, utilsFactory, iconsService, layersService) {
    var that = this;


    //  CALLBACKS
    //

    that.addCallback = function (callbackFunction) {
        if (!that.callbacksArray) {
            that.callbacksArray = [];
        }

        that.callbacksArray.push(callbackFunction);
    };

    that.removeCallback = function (callbackIndex) {
        that.callbacksArray.splice(callbackIndex, 1);
    };

    that.callCallbacks = function (newLocation) {
        that.callbacksArray.forEach(function (callbackFunction) {
+           callbackFunction(newLocation);
        });
    };


    //  MARKERS
    //

    that.setWarningLocation = function (newLocation) {
        that.warningMarker.setLatLng(newLocation);
        that.callCallbacks(newLocation);
    };

    that.createWarningMarker = function (markerLocation) {
        var warningIcon = null;

        iconsService.getWarningIcon()
            .then(function (icon) {
                warningIcon = icon;

                that.warningMarker = L.marker(markerLocation, {
                    icon: warningIcon
                });

                that.warningMarker.addTo(that.map);
            });
    };


    //  CONTROLS
    //

    that.initMapControls = function () {
        that.setAttribution();
        that.setZoomControlPosition();
    };

    that.setZoomControlPosition = function () {
        that.map.zoomControl.setPosition('topright');
    };

    that.setAttribution = function () {
        that.map.attributionControl.setPrefix(globalSettings.LEAFLET_CONF.ATTRIBUTION);
    };


    //  MAP
    //

    that.getMap = function (mapSelector, element) {
        if (that.map) {
            return that.map;
        } else {
            return that.createMap(mapSelector, element);
        }
    };

    that.removeMap = function () {
        if (that.map) {
            that.map.remove();
            that.map = null;
        }
    };

    that.createMap = function (mapSelector, element) {
        that._baseLayers = {
            main: layersService.getMainLayersGroup(),
            satellite: L.tileLayer(
                globalSettings.ORTHOPHOTO_TILELAYERS.LAYER_URL,
                globalSettings.ORTHOPHOTO_TILELAYERS.OPTIONS
            )
        };

        var elementLocation = utilsFactory.getStartPoint(element);

        var mapParameters = {
            center: elementLocation,
            zoom: globalSettings.LEAFLET_CONF.DEFAULT_ZOOM,
            minZoom: globalSettings.LEAFLET_CONF.DEFAULT_MIN_ZOOM,
            maxZoom: globalSettings.LEAFLET_CONF.DEFAULT_MAX_ZOOM,
            scrollWheelZoom: true,
            layers: that._baseLayers.main
        };
        that.map = L.map(mapSelector, mapParameters);
        that.initMapControls();
        that.createWarningMarker(elementLocation);

        that.map.on('click', function(e) {
            that.setWarningLocation(e.latlng);
        });

        return that.map;
    };
}

module.exports = {
    WarningService: WarningService,
    WarningMapService: WarningMapService
};
