'use strict';

function iconsService($q, $http, $filter, globalSettings, categoriesService, poisService, servicesService) {

    var self = this;

    self.categoriesIcons = {};
    self.poisTypesIcons = {};
    self.servicesTypesIcons = {};

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
                    var promisesArray = [];

                    _.forEach(categories, function (category) {
                        var localPromise;

                        if ($filter('isSVG')(category.pictogram)) {
                            localPromise = $http({url : category.pictogram}).then(function (response) {
                                self.categoriesIcons[category.id] = response.data;
                            });
                        } else {
                            self.categoriesIcons[category.id] = '<img src="' + category.pictogram + '" />';
                            localPromise = $q.when(self.categoriesIcons[category.id]);
                        }

                        promisesArray.push(localPromise);
                    });

                    $q.all(promisesArray).then(function () {
                        deferred.resolve(self.categoriesIcons);
                        getCategoriesIconsPending = false;
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

    var getPoisIconsPending = false;
    this.getPoiTypesIcons = function getPoiTypesIcons () {
        /**
         * If there is already a promise fetching icons, return it
         */
        if (getPoisIconsPending) {
            return getPoisIconsPending;
        }

        /**
         * If icons have already been fetched, return them
         */
        if (Object.keys(self.poisTypesIcons).length) {
            return $q.when(self.poisTypesIcons);
        }

        /**
         * If icons have never been fetched, fetch them
         */
        var deferred = $q.defer();

        poisService.getPois()
            .then(function (pois) {

                var promisesArray = [];

                _.forEach(pois.features, function (poi) {
                    var localPromise;

                    if ($filter('isSVG')(poi.properties.type.pictogram)) {
                        localPromise = $http({url : poi.properties.type.pictogram}).then(function (response) {
                            self.poisTypesIcons[poi.properties.type.id] = {
                                markup: response.data,
                                isSVG: true
                            };
                        });
                    } else {
                        self.poisTypesIcons[poi.properties.type.id] = {
                            markup: '<img src="' + poi.properties.type.pictogram + '" />',
                            isSVG: false
                        };
                        localPromise = $q.when(self.poisTypesIcons[poi.properties.type.id]);
                    }

                    promisesArray.push(localPromise);
                });

                $q.all(promisesArray).then(function () {
                    deferred.resolve(self.poisTypesIcons);
                    getPoisIconsPending = false;
                });
            });
        getPoisIconsPending = deferred.promise;
        return deferred.promise;
    };

    var getPoiIconPending = {};
    this.getAPoiTypeIcon = function getAPoiTypeIcon (poiTypeId) {
        /**
         * If there is already a promise, return it
         */
        if (getPoiIconPending[poiTypeId]) {
            return getPoiIconPending[poiTypeId];
        }

        /**
         * If icon has already been fetched for current category, return it
         */
        if (self.poisTypesIcons && self.poisTypesIcons[poiTypeId]) {
            return $q.when(self.poisTypesIcons[poiTypeId]);
        }

        /**
         * If icon has never been fetched for current category, fetch it
         */
        var deferred = $q.defer();
        self.getPoiTypesIcons()
            .then(function (icons) {
                deferred.resolve(icons[poiTypeId]);
                getPoiIconPending[poiTypeId] = false;
            });

        getPoiIconPending[poiTypeId] = deferred.promise;
        return deferred.promise;

    };

    var getServicesIconsPending = false;
    this.getServiceTypesIcons = function getServiceTypesIcons () {
        /**
         * If there is already a promise fetching icons, return it
         */
        if (getServicesIconsPending) {
            return getServicesIconsPending;
        }

        /**
         * If icons have already been fetched, return them
         */
        if (Object.keys(self.servicesTypesIcons).length) {
            return $q.when(self.servicesTypesIcons);
        }

        /**
         * If icons have never been fetched, fetch them
         */
        var deferred = $q.defer();

        servicesService.getServices()
            .then(function (services) {

                var promisesArray = [];

                _.forEach(services.features, function (service) {
                    var localPromise;

                    if ($filter('isSVG')(service.properties.type.pictogram)) {
                        localPromise = $http({url : service.properties.type.pictogram}).then(function (response) {
                            self.servicesTypesIcons[service.properties.type.id] = {
                                markup: response.data,
                                isSVG: true
                            };
                        });
                    } else {
                        self.servicesTypesIcons[service.properties.type.id] = {
                            markup: '<img src="' + service.properties.type.pictogram + '" />',
                            isSVG: false
                        };
                        localPromise = $q.when(self.servicesTypesIcons[service.properties.type.id]);
                    }

                    promisesArray.push(localPromise);
                });

                $q.all(promisesArray).then(function () {
                    deferred.resolve(self.servicesTypesIcons);
                    getServicesIconsPending = false;
                });
            });
        getServicesIconsPending = deferred.promise;
        return deferred.promise;
    };

    var getServiceIconPending = {};
    this.getAServiceTypeIcon = function getAServiceTypeIcon (serviceTypeId) {
        /**
         * If there is already a promise, return it
         */
        if (getServiceIconPending[serviceTypeId]) {
            return getServiceIconPending[serviceTypeId];
        }

        /**
         * If icon has already been fetched for current category, return it
         */
        if (self.servicesTypesIcons && self.servicesTypesIcons[serviceTypeId]) {
            return $q.when(self.servicesTypesIcons[serviceTypeId]);
        }

        /**
         * If icon has never been fetched for current category, fetch it
         */
        var deferred = $q.defer();
        self.getServiceTypesIcons()
            .then(function (icons) {
                deferred.resolve(icons[serviceTypeId]);
                getServiceIconPending[serviceTypeId] = false;
            });

        getServiceIconPending[serviceTypeId] = deferred.promise;
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

    this.getChildrenIcon = function getChildrenIcon (element) {
        var deferred = $q.defer();
        var markerIcon;
        var promises = [];

        if ($filter('isSVG')(self.icons_liste.category_base.iconUrl)) {
            promises.push(
                self.getSVGIcon(self.icons_liste.category_base.iconUrl, 'category_base')
                    .then(
                        function (icon) {
                            markerIcon = icon;
                        }
                    )
            );
        } else {
            markerIcon = '<img src="' + self.icons_liste.category_base.iconUrl + '"/>';
        }

        $q.all(promises).then(
            function () {

                var markup = '' +
                    '<div class="marker" data-popup="' + element.properties.name + '">' +
                        markerIcon +
                    '</div>' +
                    '<div class="icon"><span class="step-number">' + element.properties.stepNumber + '</span></div>';

                var newIcon = new L.divIcon(_.merge({}, self.icons_liste.category_base, {
                    html: markup,
                    className: 'double-marker popup children-marker category-' + element.properties.category.id
                }));
                deferred.resolve(newIcon);
            }
        );

        return deferred.promise;
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
                        poiIcon = icon.markup;
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
                        serviceIcon = icon.markup;
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
