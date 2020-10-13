'use strict';

function treksService(globalSettings, settingsFactory, translationService, $http, $q) {

    var self = this;
    self._trekList = {};

    this.refactorTrek = function refactorTrek () {
        var lang = translationService.getCurrentLang();

        // Parse trek pictures, and change their URL
        simpleEach(self._trekList[lang].features, function (trek) {

            /**
             * Content Type
             */
            trek.properties.contentType = 'trek';

            /**
             * Trek IDs
             */
            trek.uid  = trek.uid || trek.properties.category.id + '-' + trek.id;
            trek.luid = trek.luid || lang + '_' + trek.properties.category.id + '-' + trek.id;

            /**
             * Setup main picture (use `pictures[0]`)
             */
            if (trek.properties.pictures && trek.properties.pictures.length) {
                trek.properties.picture = trek.properties.pictures[0];
            }

            /**
             * Convert relative paths to absolute URL
             */
            _.forEach(trek.properties.pictures, function (picture) {
                if (picture.url) {
                    picture.url = globalSettings.API_URL + picture.url;
                }
            });
            _.forEach(trek.properties.type1, function (aType1) {
                if (aType1.pictogram) {
                    aType1.pictogram = globalSettings.API_URL + aType1.pictogram;
                }
            });
            _.forEach(trek.properties.type2, function (aType2) {
                if (aType2.pictogram) {
                    aType2.pictogram = globalSettings.API_URL + aType2.pictogram;
                }
            });
            if (trek.properties.difficulty && trek.properties.difficulty.pictogram) {
                trek.properties.difficulty.pictogram = globalSettings.API_URL + trek.properties.difficulty.pictogram;
            }
            if (trek.properties.route && trek.properties.route.pictogram) {
                trek.properties.route.pictogram = globalSettings.API_URL + trek.properties.route.pictogram;
            }
            _.forEach(trek.properties.themes, function (theme) {
                if (theme.pictogram) {
                    theme.pictogram = globalSettings.API_URL + theme.pictogram;
                }
            });
            _.forEach(trek.properties.labels, function (label) {
                if (label.pictogram) {
                    label.pictogram = globalSettings.API_URL + label.pictogram;
                }
            });
            _.forEach(trek.properties.networks, function (network) {
                if (network.pictogram) {
                    network.pictogram = globalSettings.API_URL + network.pictogram;
                }
            });
            _.forEach(trek.properties.information_desks, function (information_desk) {
                if (information_desk.photo_url) {
                    information_desk.photo_url = globalSettings.API_URL + information_desk.photo_url;
                }
            });
            _.forEach(trek.properties.web_links, function (link) {
                if (link.category && link.category.pictogram) {
                    link.category.pictogram = globalSettings.API_URL + link.category.pictogram;
                }
            });
            if (trek.properties.thumbnail) {
                trek.properties.thumbnail = globalSettings.API_URL + trek.properties.thumbnail;
            }
            if (trek.properties.category && trek.properties.category.pictogram) {
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
            if (trek.properties.altimetric_profile) {
                trek.properties.altimetric_profile = globalSettings.API_URL + trek.properties.altimetric_profile;
            }
            if (trek.properties.practice && trek.properties.practice.pictogram) {
                trek.properties.practice.pictogram = globalSettings.API_URL + trek.properties.practice.pictogram;
            }

            /**
             * Rename property to avoid confusion with Array native property
             */
            if (trek.properties.length) {
                trek.properties.eLength = trek.properties.length;
            }

            /**
             * Relationships
             */
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
        });

        return self._trekList[lang];
    };

    var getTreksPending = false;
    this.getTreks = function getTreks () {
        var lang = translationService.getCurrentLang();

        /**
         * If there is already a promise fetching results, return it
         */
        if (getTreksPending) {
            return getTreksPending;
        }

        /**
         * If treks have already been fetched for current language, return them
         */
        if (self._trekList[lang]) {
            return $q.when(self._trekList[lang]);
        }

        /**
         * If treks have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();
        var url      = settingsFactory.treksUrl.replace(/\$lang/, lang);

        $http({url: url})
            .then(function (response) {
                self._trekList[lang] = angular.fromJson(response.data);
                self.refactorTrek();

                deferred.resolve(self._trekList[lang]);
                getTreksPending = false;
            });


        getTreksPending = deferred.promise;
        return deferred.promise;
    };

}

module.exports = {
    treksService: treksService
};
