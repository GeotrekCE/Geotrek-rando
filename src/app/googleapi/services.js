'use strict'

function googleapiService ($q) {
	var service = this;

	service.checkAPI = function checkAPI () {
		var deferred = $q.defer();

		(window && window.google) ? deferred.resolve() : jQuery.getScript('https://www.google.com/jsapi', deferred.resolve);

		return deferred.promise;
	}
}

module.exports = {
	googleapiService: googleapiService
};
