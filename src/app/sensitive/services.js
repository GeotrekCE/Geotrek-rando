'use strict';

function sensitiveService(globalSettings, settingsFactory, translationService, $http, $q) {
    console.log('sensitiveService')
    var self = this;
    self._sensitiveList = {};

    var getSensitivePending = false;

    this.parseSensitives = function (features) {
        var sensitives = [];

        var monthsString = ['JAN', 'FEV', 'MAR', 'AVR', 'MAI', 'JUI', 'JUI', 'AOU', 'SEP', 'OCT', 'NOV', 'DEC']
        var monthsMarkup = '';
        var practiceMarkup = '';

        for (var i = 0; i < 12; i++) {
        }
        
        features.map(function(feature, i) {
            var period = {}

            for (var i = 0; i < 12; i++) {
                period[monthsString[i]] = feature.properties.species.period[i]
            }

            sensitives.push({
                description: feature.properties.description,
                email: feature.properties.email,
                publication_date: feature.properties.publication_date,
                published: feature.properties.published,
                species_name: feature.properties.species.name,
                species_url: feature.properties.species.url,
                species_picto: globalSettings.API_URL + feature.properties.species.pictogram,
                period: period
            })
        });

        return sensitives 
    };

    this.getSensitive = function getSensitive (trekId) {
        var lang = translationService.getCurrentLang();
        console.log('getSensitive')
        /**
         * If there is already a promise fetching results, return it
         */
        if (getSensitivePending) {
            return getSensitivePending;
        }

        /**
         * If treks have already been fetched for current language, return them
         */
        if (self._sensitiveList[lang]) {
            return $q.when(self._sensitiveList[lang]);
        }

        /**
         * If treks have never been fetched for current language, fetch them
         */
        var deferred = $q.defer();
        var url      = settingsFactory.trekSensitiveUrl.replace(/\$lang/, lang);

        if (self._sensitiveList[lang] && self._sensitiveList[lang][trekId]) {
            deferred.resolve(self._sensitiveList[lang][trekId]);
        }

        $http({url: url + trekId + '/' + globalSettings.SENSITIVE_FILE})
            .then(function (response) {
                if (!self._sensitiveList[lang]) {
                    self._sensitiveList[lang] = {}
                }

                console.log(angular.fromJson(response.data).features);
                var sensitives = self.parseSensitives(angular.fromJson(response.data).features);
                console.log(sensitives)
                self._sensitiveList[lang][trekId] = sensitives;
                deferred.resolve(self._sensitiveList[lang][trekId]);
            });


        getSensitivePending = deferred.promise;
        return deferred.promise;
    };

}

module.exports = {
    sensitiveService: sensitiveService
};
