'use strict';

function flatService($q, $resource, settingsFactory, translationService) {

    var self = this;

    this.getFlatPages = function () {

        var deferred = $q.defer();

        if (self._flatList) {

            deferred.resolve(self._flatList);

        } else {
            var url = settingsFactory.flatUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    params: {
                        format: 'geojson'
                    },
                    isArray: true,
                    headers: {
                        'Accept-Language': translationService.getCurrentLang().code
                    }

                }
            }, {stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    self._flatList = data;
                    deferred.resolve(data);
                });

        }

        return deferred.promise;

    };
}

module.exports = {
    flatService: flatService
};