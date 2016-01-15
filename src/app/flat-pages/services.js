'use strict';

function flatService($q, $resource, utilsFactory, settingsFactory, translationService) {

    var self = this;

    this.getFlatPages = function (forceReload) {

        var deferred = $q.defer();

        if (self._flatList && !forceReload) {

            deferred.resolve(self._flatList);

        } else {
            var currentLang = translationService.getCurrentLang();
            var url = settingsFactory.flatUrl.replace(/\$lang/, currentLang);

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    isArray: true
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
                    deferred.reject('doesn\'t exist');
                }
            );

        return deferred.promise;
    };
}

module.exports = {
    flatService: flatService
};