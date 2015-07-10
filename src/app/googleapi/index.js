'use strict';

angular.module('rando.googleapi', [])
	.controller('googleapiController', function () {})
    .service('googleapi', require('./services').googleapiService);
