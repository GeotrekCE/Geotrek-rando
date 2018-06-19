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

function viewportFilter() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/viewport-filter.html'),
        controller: 'ViewportFilterController',
    };
}

module.exports = {
    mapDirective: mapDirective,
    viewportFilter: viewportFilter,
};
