'use strict';

function treksService(globalSettings, settingsFactory, $resource, $q, filtersService) {

    var self = this;

    this.getStartPoint = function (trek) {
        var firstPointCoordinates = trek.geometry.coordinates[0];

        return {
            'lat': firstPointCoordinates[1],
            'lng': firstPointCoordinates[0]
        };
    };

    this.getEndPoint = function (trek) {
        var nbPts = trek.geometry.coordinates.length;
        var lastPointCoordinates = trek.geometry.coordinates[nbPts - 1];

        return {
            'lat': lastPointCoordinates[1],
            'lng': lastPointCoordinates[0]
        };
    };

    this.getParkingPoint = function (trek) {
        var parkingCoordinates = trek.properties.parking_location;

        return parkingCoordinates ? {
            'lat': parkingCoordinates[1],
            'lng': parkingCoordinates[0]
        } : null;
    };

    this.replaceImgURLs = function (treksData) {

        // Parse trek pictures, and change their URL
        angular.forEach(treksData.features, function (trek) {
            angular.forEach(trek.properties.pictures, function (picture) {
                picture.url = globalSettings.DOMAIN + picture.url;
            });
            angular.forEach(trek.properties.usages, function (usage) {
                usage.pictogram = globalSettings.DOMAIN + usage.pictogram;
            });
            angular.forEach(trek.properties.themes, function (theme) {
                theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
            });
            angular.forEach(trek.properties.networks, function (network) {
                network.pictogram = globalSettings.DOMAIN + network.pictogram;
            });
            angular.forEach(trek.properties.information_desks, function (information_desk) {
                information_desk.photo_url = globalSettings.DOMAIN + information_desk.photo_url;
            });
            trek.properties.thumbnail = globalSettings.DOMAIN + trek.properties.thumbnail;
            trek.properties.difficulty.pictogram = globalSettings.DOMAIN + trek.properties.difficulty.pictogram;
            trek.properties.altimetric_profile = globalSettings.DOMAIN + trek.properties.altimetric_profile.replace(".json", ".svg");

            trek.properties.cat_class = 'category-treks';
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

        var filteredTreks = filtersService.filterTreks();
        deferred.resolve(filteredTreks);


        return deferred.promise;
    };

}

module.exports = {
    treksService: treksService
};