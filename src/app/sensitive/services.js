'use strict';

function sensitiveService(globalSettings, settingsFactory, translationService, $http, $q) {
    var self = this;
    self._sensitiveList = {};

    var getSensitivePending = {};

    this.parseSensitives = function (features) {
        var sensitives = [];

        var monthsString = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC']

        features.map(function(feature, i) {
            var period = {}
            var practices = []

            for (var i = 0; i < 12; i++) {
                if (feature.properties.species.period[i]) {
                    period[monthsString[i]] = true;
                }
            }

            for (var i = 0; i < feature.properties.species.practices.length; i++) {
                practices.push(feature.properties.species.practices[i].name);
            }

            sensitives.push({
                description: feature.properties.description,
                contact: feature.properties.contact,
                publication_date: feature.properties.publication_date,
                published: feature.properties.published,
                species_name: feature.properties.species.name,
                species_url: feature.properties.species.url,
                species_picto: feature.properties.species.pictogram ? globalSettings.API_URL + feature.properties.species.pictogram : globalSettings.SENSITIVE_DEFAULT_ICON,
                period: period,
                species_practices: practices
            })
        });

        return sensitives;
    };

    this.getSensitive = function getSensitive (element) {
        var elementId = element.id;
        var lang = translationService.getCurrentLang();
        /**
         * If there is already a promise fetching results, return it
         */
        if (getSensitivePending[lang] && getSensitivePending[lang][elementId]) {
            return getSensitivePending[lang][elementId];
        }

        /**
         * If treks have already been fetched for current language, return them
         */
        if (self._sensitiveList[lang] && self._sensitiveList[lang][elementId]) {
            return $q.when(self._sensitiveList[lang][elementId]);
        }

        /**
         * If treks have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();
        if (element.properties.contentType === 'trek') {
            var url  = settingsFactory.trekSensitiveUrl.replace(/\$lang/, lang);
        }
        if (element.properties.contentType === 'dive') {
            var url  = settingsFactory.diveSensitiveUrl.replace(/\$lang/, lang);
        }


        $http({url: url + elementId + '/' + globalSettings.SENSITIVE_FILE})
            .then(function (response) {
                if (!self._sensitiveList[lang]) {
                    self._sensitiveList[lang] = {}
                }

                var sensitives = self.parseSensitives(angular.fromJson(response.data).features);
                self._sensitiveList[lang][elementId] = sensitives;
                deferred.resolve(self._sensitiveList[lang][elementId]);
            });


        if (!getSensitivePending[lang]) {
            getSensitivePending[lang] = {}
        }
        getSensitivePending[lang][elementId] = deferred.promise;
        return deferred.promise;
    };

}

module.exports = {
    sensitiveService: sensitiveService
};
