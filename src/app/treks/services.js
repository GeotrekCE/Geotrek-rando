'use strict';

function treksService(globalSettings, settingsFactory, translationService, $resource, $q) {

    var self = this;
    self._trekList = [];
    var getTreksPending = false;

    this.refactorTrek = function refactorTrek (treksData) {
        // Parse trek pictures, and change their URL
        _.forEach(treksData.features, function (trek) {
            if (trek.properties.pictures) {
                _.forEach(trek.properties.pictures, function (picture) {
                    if (picture.url) {
                        picture.url = globalSettings.API_URL + picture.url;
                    }
                });
            }
            if (trek.properties.type1) {
                _.forEach(trek.properties.type1, function (aType1) {
                    if (aType1.pictogram) {
                        aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                    }
                });
            }
            if (trek.properties.type2) {
                _.forEach(trek.properties.type2, function (aType2) {
                    if (aType2.pictogram) {
                        aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                    }
                });
            }
            if (trek.properties.difficulty) {
                trek.properties.difficulty.pictogram = globalSettings.API_URL + trek.properties.difficulty.pictogram;
            }
            if (trek.properties.route) {
                trek.properties.route.pictogram = globalSettings.API_URL + trek.properties.route.pictogram;
            }
            if (trek.properties.themes) {
                _.forEach(trek.properties.themes, function (theme) {
                    if (theme.pictogram) {
                        theme.pictogram = globalSettings.API_URL + theme.pictogram;
                    }
                });
            }
            if (trek.properties.networks) {
                _.forEach(trek.properties.networks, function (network) {
                    if (network.pictogram) {
                        network.pictogram = globalSettings.API_URL + network.pictogram;
                    }
                });
            }
            if (trek.properties.information_desks) {
                _.forEach(trek.properties.information_desks, function (information_desk) {
                    if (information_desk.photo_url) {
                        information_desk.photo_url = globalSettings.API_URL + information_desk.photo_url;
                    }
                });
            }
            if (trek.properties.web_links) {
                _.forEach(trek.properties.web_links, function (link) {
                    if (link.category && link.category.pictogram) {
                        link.category.pictogram = globalSettings.API_URL + link.category.pictogram;
                    }
                });
            }
            if (trek.properties.thumbnail) {
                trek.properties.thumbnail = globalSettings.API_URL + trek.properties.thumbnail;
            }
            if (trek.properties.category.pictogram) {
                trek.properties.category.pictogram = globalSettings.API_URL + trek.properties.category.pictogram;
            }
            if (trek.properties.gpx) {
                trek.properties.gpx = globalSettings.API_URL + trek.properties.gpx;
            }
            if (trek.properties.kml) {
                trek.properties.kml = globalSettings.API_URL + trek.properties.kml;
            }
            if (trek.properties.printable) {
                trek.properties.printable = globalSettings.API_URL + trek.properties.printable;
            }
            if (trek.properties['length']) {
                trek.properties.eLength = trek.properties['length'];
            }
            if (trek.properties.altimetric_profile) {
                trek.properties.altimetric_profile = globalSettings.API_URL + trek.properties.altimetric_profile;
            }
            if (trek.properties.relationships.length > 0) {
                var relatedElements = {
                    has_common_departure: [],
                    has_common_edge: [],
                    is_circuit_step: []
                };

                _.forEach(trek.properties.relationships, function (relatedTrek) {
                    if (relatedTrek.published) {
                        if (relatedTrek.has_common_departure) {
                            relatedElements.has_common_departure.push(relatedTrek.trek);
                        }
                        if (relatedTrek.has_common_edge) {
                            relatedElements.has_common_edge.push(relatedTrek.trek);
                        }
                        if (relatedTrek.is_circuit_step) {
                            relatedElements.is_circuit_step.push(relatedTrek.trek);
                        }
                    }
                });

                trek.properties.relationships = relatedElements;
            }
            if (!trek.uid) {
                trek.uid = trek.properties.category.id + '-' + trek.id;
            }
            if (!trek.luid) {
                var lang = translationService.getCurrentLang();
                trek.luid = lang + '_' + trek.properties.category.id + '-' + trek.id;
            }
            trek.properties.contentType = 'trek';
        });
        return treksData;
    };

    this.getTreks = function getTreks () {

        if (getTreksPending) return getTreksPending;

        var deferred = $q.defer();
        var lang = translationService.getCurrentLang();

        if (self._trekList[lang]) {

            deferred.resolve(self._trekList[lang]);
            getTreksPending = false;

        } else {
            var currentLang = translationService.getCurrentLang();
            var url = settingsFactory.treksUrl.replace(/\$lang/, currentLang);
            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var refactoredTreks = self.refactorTrek(data);
                    self._trekList[lang] = refactoredTreks;
                    deferred.resolve(refactoredTreks);
                    getTreksPending = false;
                });

        }
        getTreksPending = deferred.promise;
        return deferred.promise;

    };

}

module.exports = {
    treksService: treksService
};
