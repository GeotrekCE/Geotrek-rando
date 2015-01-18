'use strict';

function contentsService(globalSettings, settingsFactory, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (contentsData) {        

        // Parse content pictures, and change their URL
        angular.forEach(contentsData, function(content) {

            content.category.pictogram = globalSettings.DOMAIN + content.category.pictogram;
            angular.forEach(content.themes, function(theme) {
                theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
            });
            content.map_image_url = globalSettings.DOMAIN + content.map_image_url;
            content.filelist_url = globalSettings.DOMAIN + content.filelist_url;
            content.printable = globalSettings.DOMAIN + content.printable;
            content.thumbnail = globalSettings.DOMAIN + content.thumbnail;
            angular.forEach(content.pictures, function(picture) {
                picture.url = globalSettings.DOMAIN + picture.url;
            });
            
        });
        return contentsData;
    };

    this.getContents = function () {

        var deferred = $q.defer();

        if (self._contentsList) {

            deferred.resolve(self._contentsList);

        } else {
            var url = settingsFactory.touristicUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: true
                }
            },{stripTrailingSlashes: false});

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

    this.replaceImgURLs = function (eventsData) {        

        // Parse trEvent pictures, and change their URL
        angular.forEach(eventsData.b, function(trEvent) {

            angular.forEach(trEvent.themes, function(theme) {
                theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
            });
            trEvent.map_image_url = globalSettings.DOMAIN + trEvent.map_image_url;
            trEvent.filelist_url = globalSettings.DOMAIN + trEvent.filelist_url;
            trEvent.printable = globalSettings.DOMAIN + trEvent.printable;
            trEvent.thumbnail = globalSettings.DOMAIN + trEvent.thumbnail;
            angular.forEach(trEvent.pictures, function(picture) {
                picture.url = globalSettings.DOMAIN + picture.url;
            });
            
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
                    isArray: true,
                    cache: true
                }
            },{stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var convertedImgs = self.replaceImgURLs(data);
                    self._eventsList = convertedImgs;
                    deferred.resolve(convertedImgs);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    contentsService: contentsService,
    eventsService: eventsService
};