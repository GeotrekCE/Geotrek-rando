'use strict';

function iconsService($resource, $q, $http, $filter, globalSettings, categoriesService, poisService, servicesService) {

    var self = this;

    self.categoriesIcons = {};

    this.icons_liste = {
        default_icon: {},

        departure: _.merge({
            iconUrl: '/images/map/departure.svg',
            iconSize: [46, 52],
            iconAnchor: [23, 52],
            popupAnchor: [0, -52],
            className: 'departure-marker'
        }, globalSettings.DEPARTURE_ICON),
        arrival: _.merge({
            iconUrl: '/images/map/arrival.svg',
            iconSize: [46, 52],
            iconAnchor: [23, 52],
            popupAnchor: [0, -52],
            className: 'arrival-marker'
        }, globalSettings.ARRIVAL_ICON),
        departureArrival: _.merge({
            iconUrl: '/images/map/departure-arrival.svg',
            iconSize: [46, 52],
            iconAnchor: [23, 52],
            popupAnchor: [0, -52],
            className: 'departure-arrival-marker'
        }, globalSettings.DEPARTURE_ARRIVAL_ICON),

        parking: _.merge({
            iconUrl: '/images/map/parking.svg',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
            labelAnchor: [10, 10],
            className: 'parking-marker'
        }, globalSettings.PARKING_ICON),
        information: _.merge({
            iconUrl: '/images/map/info.svg',
            iconSize: [],
            iconAnchor: [],
            popupAnchor: [],
            labelAnchor: [],
            className: ''
        }, globalSettings.INFO_ICON),
        ref_point: {
            iconUrl: '',
            iconSize: [26 ,26],
            iconAnchor: [13, 26],
            popupAnchor: [0, -26],
            labelAnchor: [13, 13],
            className: 'ref-point'
        },
        poi: {
            iconUrl: '',
            iconSize: [],
            iconAnchor: [],
            popupAnchor: [],
            labelAnchor: [],
            className: ''
        },
        service: {
            iconUrl: '',
            iconSize: [],
            iconAnchor: [],
            popupAnchor: [],
            labelAnchor: [],
            className: ''
        },

        category_base: _.merge({
            iconUrl: '/images/map/category_base.svg',
            iconSize: [40, 60],
            iconAnchor: [20, 60],
            popupAnchor: [0, -60],
            labelAnchor: [20, 20]
        }, globalSettings.MARKER_BASE_ICON),
        poi_base: _.merge({
            iconUrl: '/images/map/category_base.svg',
            iconSize: [40, 60],
            iconAnchor: [20, 60],
            popupAnchor: [0, -60],
            labelAnchor: [20, 20]
        }, globalSettings.POI_BASE_ICON),
        service_base: _.merge({
            iconUrl: '',
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15],
            labelAnchor: [15, 15]
        }, globalSettings.SERVICE_BASE_ICON)

    };

    var getCategoriesIconsPending = false;
    this.getCategoriesIcons = function getCategoriesIcons () {
        /**
         * If there is already a promise fetching icons, return it
         */
        if (getCategoriesIconsPending) {
            return getCategoriesIconsPending;
        }

        /**
         * If icons have already been fetched, return them
         */
        if (Object.keys(self.categoriesIcons).length) {
            return $q.when(self.categoriesIcons);
        }

        /**
         * If icons have never been fetched, fetch them
         */
        var deferred = $q.defer();

        categoriesService.getCategories()
            .then(
                function (categories) {
                    var counter = 0;
                    _.forEach(categories, function (category) {
                        if (!self.categoriesIcons) {
                            self.categoriesIcons = {};
                        }
                        counter++;
                        var currentCounter = counter;
                        if ($filter('isSVG')(category.pictogram)) {
                            var requests = $resource(category.pictogram, {}, {
                                query: {
                                    method: 'GET',
                                    cache: true
                                }
                            });

                            requests.query().$promise
                                .then(function (icon) {
                                    var finalIcon = '';
                                    _.each(icon, function(el, index) {
                                        if (!isNaN(parseInt(index, 10))) {
                                            finalIcon += el;
                                        }
                                    });
                                    self.categoriesIcons[category.id] = finalIcon;
                                    if (currentCounter === _.size(categories)) {
                                        deferred.resolve(self.categoriesIcons);
                                        setTimeout(function () {
                                            getCategoriesIconsPending = false;
                                        }, 250);
                                    }
                                });
                        } else {
                            self.categoriesIcons[category.id] = '<img src="' + category.pictogram + '" />';
                            if (currentCounter === _.size(categories)) {
                                deferred.resolve(self.categoriesIcons);
                                setTimeout(function () {
                                    getCategoriesIconsPending = false;
                                }, 250);
                            }
                        }

                    });
                }
            );
        getCategoriesIconsPending = deferred.promise;
        return deferred.promise;
    };

    var getCategoryIconPending = {};
    this.getCategoryIcon = function getCategoryIcon (categoryId) {
        /**
         * If there is already a promise, return it
         */
        if (getCategoryIconPending[categoryId]) {
            return getCategoryIconPending[categoryId];
        }

        /**
         * If icon has already been fetched for current category, return it
         */
        if (self.categoriesIcons && self.categoriesIcons[categoryId]) {
            return $q.when(self.categoriesIcons[categoryId]);
        }

        /**
         * If icon has never been fetched for current category, fetch it
         */
        var deferred = $q.defer();
        self.getCategoriesIcons()
            .then(function (icons) {
                deferred.resolve(icons[categoryId]);
                getCategoryIconPending[categoryId] = false;
            });

        getCategoryIconPending[categoryId] = deferred.promise;
        return deferred.promise;
    };

    this.getPoiTypesIcons = function getPoiTypesIcons (forceRefresh) {
        var deferred = $q.defer();

        if (self.poisTypesIcons && !forceRefresh) {
            deferred.resolve(self.poisTypesIcons);
        } else {

            poisService.getPois(forceRefresh)
                .then(
                    function (pois) {
                        var counter = 0;
                        _.forEach(pois.features, function (poi) {
                            if (!self.poisTypesIcons) {
                                self.poisTypesIcons = {};
                            }
                            counter++;
                            var currentCounter = counter;
                            if (!$filter('isSVG')(poi.properties.type.pictogram)) {
                                self.poisTypesIcons[poi.properties.type.id] = {
                                    markup: poi.properties.type.pictogram,
                                    isSVG: false
                                };
                                if (currentCounter === _.size(pois.features)) {
                                    deferred.resolve(self.poisTypesIcons);
                                }
                            } else {
                                $http.get(poi.properties.type.pictogram)
                                    .success(
                                        function (icon) {
                                            self.poisTypesIcons[poi.properties.type.id] = {
                                                markup: icon.toString(),
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(pois.features)) {
                                                deferred.resolve(self.poisTypesIcons);
                                            }
                                        }
                                    ).error(
                                        function () {
                                            self.poisTypesIcons[poi.properties.type.id] = {
                                                markup: '',
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(pois)) {
                                                deferred.resolve(self.poisTypesIcons);
                                            }
                                        }
                                    );
                            }
                        });
                    }
                );
        }

        return deferred.promise;
    };

    this.getAPoiTypeIcon = function getAPoiTypeIcon (poiTypeId, forceRefresh) {
        var deferred = $q.defer();
        if (self.poisTypesIcons && !forceRefresh) {
            deferred.resolve(self.poisTypesIcons[poiTypeId]);
        } else {
            self.getPoiTypesIcons(forceRefresh)
                .then(
                    function (icons) {
                        deferred.resolve(icons[poiTypeId]);
                    }
                );
        }

        return deferred.promise;
    };

    this.getServiceTypesIcons = function getServiceTypesIcons (forceRefresh) {
        var deferred = $q.defer();

        if (self.servicesTypesIcons && !forceRefresh) {
            deferred.resolve(self.servicesTypesIcons);
        } else {

            servicesService.getServices(forceRefresh)
                .then(
                    function (services) {
                        var counter = 0;
                        _.forEach(services.features, function (service) {
                            if (!self.servicesTypesIcons) {
                                self.servicesTypesIcons = {};
                            }
                            counter++;
                            var currentCounter = counter;
                            if (!$filter('isSVG')(service.properties.type.pictogram)) {
                                self.servicesTypesIcons[service.properties.type.id] = {
                                    markup: service.properties.type.pictogram,
                                    isSVG: false
                                };
                                if (currentCounter === _.size(services.features)) {
                                    deferred.resolve(self.servicesTypesIcons);
                                }
                            } else {
                                $http.get(service.properties.type.pictogram)
                                    .success(
                                        function (icon) {
                                            self.servicesTypesIcons[service.properties.type.id] = {
                                                markup: icon.toString(),
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(services.features)) {
                                                deferred.resolve(self.servicesTypesIcons);
                                            }
                                        }
                                    ).error(
                                        function () {
                                            self.servicesTypesIcons[service.properties.type.id] = {
                                                markup: '',
                                                isSVG: true
                                            };
                                            if (currentCounter === _.size(services)) {
                                                deferred.resolve(self.servicesTypesIcons);
                                            }
                                        }
                                    );
                            }
                        });
                    }
                );
        }

        return deferred.promise;
    };

    this.getAServiceTypeIcon = function getAServiceTypeIcon (serviceTypeId, forceRefresh) {
        var deferred = $q.defer();
        if (self.servicesTypesIcons && !forceRefresh) {
            deferred.resolve(self.servicesTypesIcons[serviceTypeId]);
        } else {
            self.getServiceTypesIcons(forceRefresh)
                .then(
                    function (icons) {
                        deferred.resolve(icons[serviceTypeId]);
                    }
                );
        }

        return deferred.promise;
    };


    var getSVGIconPending = {};
    this.getSVGIcon = function getSVGIcon (url, iconName) {
        /**
         * If there is already a promise fetching icon, return it
         */
        if (getSVGIconPending[url]) {
            return getSVGIconPending[url];
        }

        /**
         * If icon has already been fetched, return it
         */
        if (self.icons_liste[iconName].markup) {
            return $q.when(self.icons_liste[iconName].markup);
        }

        /**
         * If icon has never been fetched, fetch it
         */
        var deferred = $q.defer();

        $http({url: url})
            .then(function (response) {
                var icon = response.data;
                self.icons_liste[iconName].markup = icon;
                deferred.resolve(icon);
                getSVGIconPending[url] = false;
            });

        getSVGIconPending[url] = deferred.promise;
        return deferred.promise;
    };

    this.getClusterIcon = function getClusterIcon (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -40],
            className: 'element-cluster',
            html: '<div class="marker"><span class="count">' + cluster.getChildCount() + '</span></div>'
        });
    };

    this.getNearClusterIcon = function getNearClusterIcon (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -40],
            className: 'near-cluster',
            html: '<div class="marker"><span class="count">' + cluster.getChildCount() + '</span></div>'
        });
    };

    this.getChildClusterIcon = function getChildClusterIcon (cluster) {
        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -40],
            className: 'children-cluster',
            html: '<div class="marker"><span class="count">' + cluster.getChildCount() + '</span></div>'
        });
    };

    this.getPOIClusterIcon = function getPOIClusterIcon (cluster) {
        var children = cluster.getAllChildMarkers(),
            iconsMarkup = '',
            i = 0,
            icons = {ICON0: '', ICON1: '', ICON2: '', ICON3: ''},
            template = '' +
                '<div class="icon-group">' +
                    '<div class="icon">{ICON0}</div>' +
                    '<div class="icon">{ICON1}</div>' +
                    '<div class="icon">{ICON2}</div>' +
                    '<div class="icon">{ICON3}</div>' +
                '</div>';

        for (i = 0; i < Math.min(children.length, 4); i++) {
            if (children[i].options.result && children[i].options.result.properties.type) {
                icons['ICON'+i] = '<img src="' + children[i].options.result.properties.type.pictogram + '"/>';
            }
        }
        iconsMarkup = L.Util.template(template, icons);

        return new L.DivIcon({
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -40],
            className: 'poi-cluster',
            html: iconsMarkup
        });
    };

    this.getRefIcon = function getRefIcon (refElement) {
        var deferred = $q.defer();

        var markup = '<span>' + refElement.order + '</span>';

        var newIcon = new L.divIcon(_.merge({}, self.icons_liste.ref_point, {
            html: markup,
            className: self.icons_liste.ref_point.className + ' ' + self.icons_liste.ref_point.className + '-' + refElement.order
        }));
        deferred.resolve(newIcon);

        return deferred.promise;
    };

    this.getIcon = function getIcon (iconName) {
        var deferred = $q.defer();

        if (!iconName || !self.icons_liste[iconName]) {
            deferred.reject('icon doesn\'t exist');
        } else {
            if (self[iconName]) {
                deferred.resolve(self[iconName]);
            } else {
                if (!$filter('isSVG')(self.icons_liste[iconName].iconUrl)) {
                    self[iconName] = new L.divIcon(_.merge({}, self.icons_liste[iconName], {
                        html: self.icons_liste[iconName].iconUrl
                    }));
                    deferred.resolve(self[iconName]);
                } else {
                    self.getSVGIcon(self.icons_liste[iconName].iconUrl, iconName)
                        .then(
                            function (iconMarkup) {

                                self[iconName] = new L.divIcon(_.merge({}, self.icons_liste[iconName], {
                                    html: iconMarkup
                                }));
                                deferred.resolve(self[iconName]);
                            }
                        );
                }
            }
        }

        return deferred.promise;
    };

    this.getPOIIcon = function getPOIIcon (poi) {
        var deferred = $q.defer(),
            baseIcon = null,
            poiIcon = null,
            promises = [];

        if (self.icons_liste.poi_base.iconUrl) {
            promises.push(
                self.getSVGIcon(self.icons_liste.poi_base.iconUrl, 'poi_base')
                    .then(
                        function (icon) {
                            baseIcon = icon;
                        }
                    )
            );
        }

        promises.push(
            self.getAPoiTypeIcon(poi.properties.type.id)
                .then(
                    function (icon) {
                        if (icon.isSVG) {
                            poiIcon = icon.markup;
                        } else {
                            poiIcon = '<img src="' + icon.markup + '" alt=""';
                        }
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    var markup;

                    if (baseIcon) {
                        markup = '' +
                            '<div class="marker" data-popup="' + poi.properties.name + '">' +
                                baseIcon +
                            '</div>' +
                            '<div class="icon">' + poiIcon + '</div>';
                    } else {
                        markup = '' +
                            '<div class="marker" data-popup="' + poi.properties.name + '">' +
                                '<div class="icon">' + poiIcon + '</div>' +
                            '</div>';
                    }

                    var newIcon = new L.divIcon(_.merge({}, self.icons_liste.poi_base, {
                        html: markup,
                        className: 'double-marker popup poi layer-' + poi.properties.type.id + '-' + poi.id + ' category-' + poi.properties.type.id
                    }));
                    deferred.resolve(newIcon);
                }
            );

        return deferred.promise;

    };

    this.getServiceIcon = function getServiceIcon (service, forceRefresh) {
        var deferred = $q.defer(),
            baseIcon = null,
            serviceIcon = null,
            promises = [];

        if (self.icons_liste.service_base.iconUrl) {
            promises.push(
                self.getSVGIcon(self.icons_liste.service_base.iconUrl, 'service_base', forceRefresh)
                    .then(
                        function (icon) {
                            baseIcon = icon;
                        }
                    )
            );
        }

        promises.push(
            self.getAServiceTypeIcon(service.properties.type.id, forceRefresh)
                .then(
                    function (icon) {
                        if (icon.isSVG) {
                            serviceIcon = icon.markup;
                        } else {
                            serviceIcon = '<img src="' + icon.markup + '" alt=""';
                        }
                    }
                )
        );

        $q.all(promises)
            .then(
                function () {
                    var markup;

                    if (baseIcon) {
                        markup = '' +
                            '<div class="marker" data-popup="' + service.properties.type.name + '">' +
                                baseIcon +
                            '</div>' +
                            '<div class="icon">' + serviceIcon + '</div>';
                    } else {
                        markup = '' +
                            '<div class="marker" data-popup="' + service.properties.type.name + '">' +
                                '<div class="icon">' + serviceIcon + '</div>' +
                            '</div>';
                    }

                    var newIcon = new L.divIcon(_.merge({}, self.icons_liste.service_base, {
                        html: markup,
                        className: 'double-marker popup service layer-' + service.properties.type.id + '-' + service.id
                    }));
                    deferred.resolve(newIcon);
                }
            );

        return deferred.promise;

    };

    this.getWarningIcon = function getWarningIcon () {
        var deferred = $q.defer();

        self.getSVGIcon(self.icons_liste.poi_base.iconUrl, 'category_base')
            .then(function (icon) {
                var markup = '' +
                    '<div class="marker">' +
                        icon +
                    '</div>' +
                    '<div class="icon"><i class="fa fa-exclamation-circle"></i></div>';

                var warningIcon = new L.DivIcon(_.merge({}, self.icons_liste.poi_base, {
                    html: markup,
                    className: 'double-marker warning-marker'
                }));

                deferred.resolve(warningIcon);
            });

        return deferred.promise;
    };

    this.getElementIcon = function getElementIcon (element, forceRefresh) {

        var deferred = $q.defer(),
            markerIcon,
            categoryIcon,
            promises = [];

        if ($filter('isSVG')(self.icons_liste.category_base.iconUrl)) {
            promises.push(
                self.getSVGIcon(self.icons_liste.category_base.iconUrl, 'category_base', forceRefresh)
                    .then(
                        function (icon) {
                            markerIcon = icon;
                        }
                    )
            );
        } else {
            markerIcon = '<img src="' + self.icons_liste.category_base.iconUrl + '"/>';
        }

        promises.push(
            self.getCategoryIcon(element.properties.category.id, forceRefresh)
                .then(
                    function (icon) {
                        categoryIcon = icon;
                    }
                )
        );

        $q.all(promises).then(
            function () {

                var markup = '' +
                    '<div class="marker" data-popup="' + element.properties.name + '">' +
                        markerIcon +
                    '</div>' +
                    '<div class="icon">' + categoryIcon + '</div>';

                var newIcon = new L.divIcon(_.merge({}, self.icons_liste.category_base, {
                    html: markup,
                    className: 'double-marker popup layer-category-' + element.properties.category.id + '-' + element.id + ' category-' + element.properties.category.id
                }));
                deferred.resolve(newIcon);
            }
        );

        return deferred.promise;

    };

}

module.exports = {
    iconsService: iconsService
};
