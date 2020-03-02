'use strict';

angular.module('rando.media', [])
    .controller('MediaController', require('./controllers').MediaController)
    .directive('mediaPlayer', require('./directives').mediaPlayer);
