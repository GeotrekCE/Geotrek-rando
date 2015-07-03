'use strict';

function WarningService(translationService, settingsFactory, $resource, $q) {
    var self = this;

    self.getWarningCategories = function (forceRefresh) {
        var deferred = $q.defer();

        if (self._warningCategories && !forceRefresh) {

            deferred.resolve(self._warningCategories);

        } else {
            var lang = translationService.getCurrentLang();
            if (lang.code) {
                lang = lang.code;
            }
            var url = settingsFactory.warningCategoriesUrl.replace(/\$lang/, lang);
            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (data) {
                    var categories = angular.fromJson(data);
                    self._warningCategories = categories;
                    deferred.resolve(categories);
                });

        }

        return deferred.promise;
    };

    self.sendWarning = function (formData) {
        var deferred = $q.defer(),
            url = settingsFactory.warningTargetUrl;

        console.log(formData);
        console.log(url);
        var requests = $resource(url, {}, {
            query: {
                method: 'POST',
                data: {
                    name: formData.name,
                    email: formData.email,
                    category: formData.category,
                    comment: formData.comment,
                    geom: {
                        type: "Point",
                        coordinates: [
                            formData.location.lng,
                            formData.location.lat
                        ]
                    }
                }
            }
        }, {stripTrailingSlashes: false});

        requests.query().$promise
            .then(function (message) {
                console.log(message);
                deferred.resolve(message);
            });

        return deferred.promise;
    };
}

module.exports = {
    WarningService: WarningService
};