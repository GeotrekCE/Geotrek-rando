'use strict';

var controllers = require('./controllers');

function mapDirective() {
    console.log('map loading');
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/map.html'),
        controller: controllers.MapController
    };
}

module.exports = {
    mapDirective: mapDirective
};
