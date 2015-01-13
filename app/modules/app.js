'use strict';

var dependencies = [
	// Our submodules
	'rando.config',

  	// External stuff
	'ui.router'
 ];

var angular = require('angular');

angular.module('geotrekRando', dependencies);

require('./config');
require('./commons');
require('./head');
require('./liste');
require('./map');
require('./sidebar');
require('./detail');


