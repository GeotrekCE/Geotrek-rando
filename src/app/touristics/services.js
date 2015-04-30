'use strict';

function contentsService(globalSettings, settingsFactory, translationService, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (contentsData) {

        // Parse content pictures, and change their URL
        _.forEach(contentsData.features, function (content) {

            if (content.properties.category.pictogram) {
                content.properties.category.pictogram = globalSettings.API_URL + content.properties.category.pictogram;
            }
            if (content.properties.themes) {
                _.forEach(content.properties.themes, function (theme) {
                    if (theme.pictogram) {
                        theme.pictogram = globalSettings.API_URL + theme.pictogram;
                    }
                });
            }
            if (content.properties.map_image_url) {
                content.properties.map_image_url = globalSettings.API_URL + content.properties.map_image_url;
            }
            if (content.properties.filelist_url) {
                content.properties.filelist_url = globalSettings.API_URL + content.properties.filelist_url;
            }
            if (content.properties.printable) {
                content.properties.printable = globalSettings.API_URL + content.properties.printable;
            }
            if (content.properties.thumbnail) {
                content.properties.thumbnail = globalSettings.API_URL + content.properties.thumbnail;
            }
            if (content.properties.pictures) {
                _.forEach(content.properties.pictures, function (picture) {
                    if (picture.url) {
                        picture.url = globalSettings.API_URL + picture.url;
                    }
                });
            }
            content.properties.contentType = 'content';
        });
        return contentsData;
    };

    this.getContents = function (forceRefresh) {

        var deferred = $q.defer();

        if (self._contentsList && !forceRefresh) {

            deferred.resolve(self._contentsList);

        } else {
            var url = settingsFactory.touristicUrl.replace(/\$lang/, translationService.getCurrentLang().code);

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

function eventsService(globalSettings, settingsFactory, translationService, $resource, $q) {

    var self = this;

    this.refactorEvents = function (eventsData) {

        // Parse trEvent pictures, and change their URL
        _.forEach(eventsData.features, function (trEvent) {

            if (trEvent.properties.category.pictogram) {
                trEvent.properties.category.pictogram = globalSettings.API_URL + trEvent.properties.category.pictogram;
            }
            if (trEvent.properties.themes) {
                _.forEach(trEvent.properties.themes, function (theme) {
                    if (theme.pictogram) {
                        theme.pictogram = globalSettings.API_URL + theme.pictogram;
                    }
                });
            }
            if (trEvent.properties.map_image_url) {
                trEvent.properties.map_image_url = globalSettings.API_URL + trEvent.properties.map_image_url;
            }
            if (trEvent.properties.filelist_url) {
                trEvent.properties.filelist_url = globalSettings.API_URL + trEvent.properties.filelist_url;
            }
            if (trEvent.properties.printable) {
                trEvent.properties.printable = globalSettings.API_URL + trEvent.properties.printable;
            }
            if (trEvent.properties.thumbnail) {
                trEvent.properties.thumbnail = globalSettings.API_URL + trEvent.properties.thumbnail;
            }
            if (trEvent.properties.pictures) {
                _.forEach(trEvent.properties.pictures, function (picture) {
                    if (picture.url) {
                        picture.url = globalSettings.API_URL + picture.url;
                    }
                });
            }

            trEvent.properties.contentType = 'event';

        });
        return eventsData;
    };

    this.getEvents = function (forceRefresh) {

        var deferred = $q.defer();

        if (self._eventsList && !forceRefresh) {

            deferred.resolve(self._eventsList);

        } else {
            var url = settingsFactory.eventsUrl.replace(/\$lang/, translationService.getCurrentLang().code);

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
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