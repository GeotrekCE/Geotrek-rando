'use strict';

function flatService($q, $resource, utilsFactory, settingsFactory, translationService) {

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

    this.getAFlatPage = function (pageId) {
        var deferred = $q.defer();
        self.getFlatPages()
            .then(
                function (data) {
                    _.forEach(data, function (currentPage) {
                        if (!isNaN(utilsFactory.isTrueInt(pageId))) {
                            if (currentPage.id === parseInt(pageId, 10)) {
                                deferred.resolve(currentPage);
                            }
                        } else if (typeof pageId === 'string') {
                            if (currentPage.slug === pageId) {
                                deferred.resolve(currentPage);
                            }
                        }
                    });
                }
            );

        return deferred.promise;
    };
}

module.exports = {
    flatService: flatService
};