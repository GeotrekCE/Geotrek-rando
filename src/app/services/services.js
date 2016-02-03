'use strict';

function servicesService($resource, $q, globalSettings, settingsFactory, translationService) {

    var self = this;

    this.refactorServices = function refactorServices (servicesData) {
        // Parse trek pictures, and change their URL
        _.forEach(servicesData.features, function (service) {

            if (service.properties.type.pictogram && service.properties.type.pictogram !== null) {
                service.properties.type.pictogram = globalSettings.API_URL + service.properties.type.pictogram;
            }

        });
        return servicesData;
    };

    this.getServices = function getServices (forceRefresh) {

        var deferred = $q.defer();

        if (self._services && !forceRefresh) {

            deferred.resolve(self._services);

        } else {
            var currentLang = translationService.getCurrentLang();
            var url = settingsFactory.servicesUrl.replace(/\$lang/, currentLang);

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    cache: true
                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    var refactoredServices = self.refactorServices(data);
                    self._services = refactoredServices;
                    deferred.resolve(self._services);
                });

        }

        return deferred.promise;

    };

    this.getServicesFromElement = function getServicesFromElement (elementId) {

        var deferred = $q.defer();
        var currentLang = translationService.getCurrentLang();
        var url = settingsFactory.trekUrl.replace(/\$lang/, currentLang) + elementId + '/' + globalSettings.SERVICES_FILE;
        var requests = $resource(url, {}, {
            query: {
                method: 'GET',
                cache: true
            }
        }, {stripTrailingSlashes: false});

        requests.query().$promise
            .then(function (file) {
                var data = angular.fromJson(file);
                var refactoredService = self.refactorServices(data);
                deferred.resolve(refactoredService);
            });

        return deferred.promise;
    };

}

module.exports = {
    servicesService: servicesService
};
