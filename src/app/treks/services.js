'use strict';

function treksService(globalSettings, settingsFactory, $resource, $q) {

    var self = this;

    this.refactorTrek = function (treksData) {
        // Parse trek pictures, and change their URL
        _.forEach(treksData.features, function (trek) {
            if (trek.properties.pictures && trek.properties.pictures !== null) {
                _.forEach(trek.properties.pictures, function (picture) {
                    picture.url = globalSettings.DOMAIN + picture.url;
                });
            }
            if (trek.properties.type1 && trek.properties.type1 !== null) {
                _.forEach(trek.properties.type1, function (aType1) {
                    aType1.pictogram = globalSettings.DOMAIN + aType1.pictogram;
                });
            }
            if (trek.properties.type2 && trek.properties.type2 !== null) {
                _.forEach(trek.properties.type2, function (aType2) {
                    aType2.pictogram = globalSettings.DOMAIN + aType2.pictogram;
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
            if (trek.properties.category.pictogram && trek.properties.category.pictogram !== null) {
                trek.properties.category.pictogram = globalSettings.DOMAIN + trek.properties.category.pictogram;
            }
            if (trek.properties.gpx && trek.properties.gpx !== null) {
                trek.properties.gpx = globalSettings.DOMAIN + trek.properties.gpx;
            }
            if (trek.properties.kml && trek.properties.kml !== null) {
                trek.properties.kml = globalSettings.DOMAIN + trek.properties.kml;
            }
            if (trek.properties.printable && trek.properties.printable !== null) {
                trek.properties.printable = globalSettings.DOMAIN + trek.properties.printable;
            }
            if (trek.properties.altimetric_profile && trek.properties.altimetric_profile !== null) {
                trek.properties.altimetric_profile = globalSettings.DOMAIN + trek.properties.altimetric_profile;
            }
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
                    params: {
                        format: 'geojson'
                    },
                    cache: true

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