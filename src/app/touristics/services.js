'use strict';

function contentsService(globalSettings, settingsFactory, $resource, $q, utilsFactory) {

    var self = this;

    this.replaceImgURLs = function (contentsData) {

        // Parse content pictures, and change their URL
        _.forEach(contentsData.features, function (content) {

            if (content.properties.themes && content.properties.themes !== null) {
                content.properties.category.pictogram = globalSettings.DOMAIN + content.properties.category.pictogram;
            }
            if (content.properties.themes && content.properties.themes !== null) {
                _.forEach(content.properties.themes, function (theme) {
                    theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
                });
            }
            if (content.properties.themes && content.properties.themes !== null) {
                content.properties.map_image_url = globalSettings.DOMAIN + content.properties.map_image_url;
            }
            if (content.properties.themes && content.properties.themes !== null) {
                content.properties.filelist_url = globalSettings.DOMAIN + content.properties.filelist_url;
            }
            if (content.properties.themes && content.properties.themes !== null) {
                content.properties.printable = globalSettings.DOMAIN + content.properties.printable;
            }
            if (content.properties.themes && content.properties.themes !== null) {
                content.properties.thumbnail = globalSettings.DOMAIN + content.properties.thumbnail;
            }
            if (content.properties.themes && content.properties.themes !== null) {
                _.forEach(content.properties.pictures, function (picture) {
                    picture.url = globalSettings.DOMAIN + picture.url;
                });
            }
            content.category = utilsFactory.removeDiacritics(content.properties.category.label.toLowerCase());

        });
        return contentsData;
    };

    this.getContents = function () {

        var deferred = $q.defer();

        if (self._contentsList) {

            deferred.resolve(self._contentsList);

        } else {
            //var url = settingsFactory.touristicUrl;
            var url = 'jsons/api/touristiccontents.geojson';

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var convertedImgs = self.replaceImgURLs(data);
                    self._contentsList = convertedImgs;
                    deferred.resolve(convertedImgs);
                });

        }

        return deferred.promise;

    };

}

function eventsService(globalSettings, settingsFactory, $resource, $q) {

    var self = this;

    this.refactorEvents = function (eventsData) {

        // Parse trEvent pictures, and change their URL
        _.forEach(eventsData.features, function (trEvent) {

            if (trEvent.properties.themes && trEvent.properties.themes !== null) {
                _.forEach(trEvent.properties.themes, function (theme) {
                    theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
                });
            }
            if (trEvent.properties.map_image_url && trEvent.properties.map_image_url !== null) {
                trEvent.properties.map_image_url = globalSettings.DOMAIN + trEvent.properties.map_image_url;
            }
            if (trEvent.properties.filelist_url && trEvent.properties.filelist_url !== null) {
                trEvent.properties.filelist_url = globalSettings.DOMAIN + trEvent.properties.filelist_url;
            }
            if (trEvent.properties.printable && trEvent.properties.printable !== null) {
                trEvent.properties.printable = globalSettings.DOMAIN + trEvent.properties.printable;
            }
            if (trEvent.properties.thumbnail && trEvent.properties.thumbnail !== null) {
                trEvent.properties.thumbnail = globalSettings.DOMAIN + trEvent.properties.thumbnail;
            }
            if (trEvent.properties.pictures && trEvent.properties.pictures !== null) {
                _.forEach(trEvent.properties.pictures, function (picture) {
                    picture.url = globalSettings.DOMAIN + picture.url;
                });
            }

            trEvent.category = 'events';

        });
        return eventsData;
    };

    this.getEvents = function () {

        var deferred = $q.defer();

        if (self._eventsList) {

            deferred.resolve(self._eventsList);

        } else {
            var url = settingsFactory.eventsUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    params: {
                        format: 'json'
                    },
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var refactoredEvents = self.refactorEvents(data);
                    self._eventsList = refactoredEvents;
                    deferred.resolve(refactoredEvents);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    contentsService: contentsService,
    eventsService: eventsService
};