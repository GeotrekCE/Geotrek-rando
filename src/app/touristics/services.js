'use strict';

function contentsService(settingsFactory, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (contentsData) {        

        // Parse content pictures, and change their URL
        angular.forEach(contentsData, function(content) {

            content.category.pictogram = settingsFactory.DOMAIN + content.category.pictogram;
            angular.forEach(content.themes, function(theme) {
                theme.pictogram = settingsFactory.DOMAIN + theme.pictogram;
            });
            content.map_image_url = settingsFactory.DOMAIN + content.map_image_url;
            content.filelist_url = settingsFactory.DOMAIN + content.filelist_url;
            content.printable = settingsFactory.DOMAIN + content.printable;
            content.thumbnail = settingsFactory.DOMAIN + content.thumbnail;
            angular.forEach(content.pictures, function(picture) {
                picture.url = settingsFactory.DOMAIN + picture.url;
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

function eventsService(settingsFactory, $resource, $q) {

    var self = this;

    this.replaceImgURLs = function (eventsData) {        

        // Parse trEvent pictures, and change their URL
        angular.forEach(eventsData.b, function(trEvent) {

            angular.forEach(trEvent.themes, function(theme) {
                theme.pictogram = settingsFactory.DOMAIN + theme.pictogram;
            });
            trEvent.map_image_url = settingsFactory.DOMAIN + trEvent.map_image_url;
            trEvent.filelist_url = settingsFactory.DOMAIN + trEvent.filelist_url;
            trEvent.printable = settingsFactory.DOMAIN + trEvent.printable;
            trEvent.thumbnail = settingsFactory.DOMAIN + trEvent.thumbnail;
            angular.forEach(trEvent.pictures, function(picture) {
                picture.url = settingsFactory.DOMAIN + picture.url;
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