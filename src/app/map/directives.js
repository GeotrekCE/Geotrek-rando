'use strict';

function mapDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/map.html'),
        controller: 'MapController'
    };
}

module.exports = {
    mapDirective: mapDirective
};
