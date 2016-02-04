'use strict';

function googleapiService ($q) {
    var that = this;

    that.checkAPI = function checkAPI () {
        var deferred = $q.defer();

        (window && window.google) ? deferred.resolve() : jQuery.getScript('https://www.google.com/jsapi', deferred.resolve);

        return deferred.promise;
    };
}

module.exports = {
    googleapiService: googleapiService
};
