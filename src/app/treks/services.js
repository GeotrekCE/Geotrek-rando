'use strict';

function treksService(globalSettings, settingsFactory, $resource, $q) {

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

    this.refactorTrek = function (treksData) {
        // Parse trek pictures, and change their URL
        _.forEach(treksData.features, function (trek) {
            if (trek.properties.pictures && trek.properties.pictures !== null) {
                _.forEach(trek.properties.pictures, function (picture) {
                    picture.url = globalSettings.DOMAIN + picture.url;
                });
            }
            if (trek.properties.usages && trek.properties.usages !== null) {
                _.forEach(trek.properties.usages, function (usage) {
                    usage.pictogram = globalSettings.DOMAIN + usage.pictogram;
                });
            }
            if (trek.properties.difficulty && trek.properties.difficulty !== null) {
                trek.properties.difficulty.pictogram = globalSettings.DOMAIN + trek.properties.difficulty.pictogram;
            }
            if (trek.properties.themes && trek.properties.themes !== null) {
                _.forEach(trek.properties.themes, function (theme) {
                    theme.pictogram = globalSettings.DOMAIN + theme.pictogram;
                });
            }
            if (trek.properties.networks && trek.properties.networks !== null) {
                _.forEach(trek.properties.networks, function (network) {
                    network.pictogram = globalSettings.DOMAIN + network.pictogram;
                });
            }
            if (trek.properties.information_desks && trek.properties.information_desks !== null) {
                _.forEach(trek.properties.information_desks, function (information_desk) {
                    information_desk.photo_url = globalSettings.DOMAIN + information_desk.photo_url;
                });
            }
            if (trek.properties.thumbnail && trek.properties.thumbnail !== null) {
                trek.properties.thumbnail = globalSettings.DOMAIN + trek.properties.thumbnail;
            }
            if (trek.properties.pictogram && trek.properties.pictogram !== null) {
                trek.properties.difficulty.pictogram = globalSettings.DOMAIN + trek.properties.difficulty.pictogram;
            }
            if (trek.properties.altimetric_profile && trek.properties.altimetric_profile !== null) {
                trek.properties.altimetric_profile = globalSettings.DOMAIN + trek.properties.altimetric_profile;
            }
            trek.category = 'treks';
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
                    cache: true,

                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var refactoredTreks = self.refactorTrek(data);
                    self._trekList = refactoredTreks;
                    deferred.resolve(refactoredTreks);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    treksService: treksService
};