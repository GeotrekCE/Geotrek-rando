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