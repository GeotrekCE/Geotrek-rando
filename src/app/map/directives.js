'use strict';

var controllers = require('./controllers');

function mapDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/map.html'),
        controller: controllers.MapController
    };
}

module.exports = {
    mapDirective: mapDirective
};
