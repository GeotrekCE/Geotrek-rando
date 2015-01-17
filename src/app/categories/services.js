'use strict';

function categoriesService(settingsFactory, $resource, $q) {
    var self = this;

    this.getCategories = function () {

        var deferred = $q.defer();

        if (self._categoriesList) {

            deferred.resolve(self._categoriesList);

        } else {
            var url = settingsFactory.categoriesUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET',
                    isArray: true,
                    cache: true
                }
            },{stripTrailingSlashes: false});

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    self._categoriesList = data;
                    deferred.resolve(data);
                });

        }

        return deferred.promise;

    };
};

module.exports = {
    categoriesService: categoriesService
}