'use strict';

function treksService(settingsFactory, $resource, $q) {

    var self = this;

    this.getTreks = function () {

        var deferred = $q.defer();

        if (self._trekList) {

            deferred.resolve(self._trekList);

        } else {
            var url = settingsFactory.treksUrl;

            var requests = $resource(url, {}, {
                query: {
                    method: 'GET'
                }
            });

            requests.query().$promise
                .then(function (file) {
                    var data = angular.fromJson(file);
                    self._trekList = data;
                    deferred.resolve(data);
                });

        }

        return deferred.promise;

    };

}

module.exports = {
    treksService: treksService
};