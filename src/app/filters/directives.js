'use strict';

function globalFiltersDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/global-filters.html'),
        controller: 'GlobalFiltersController'
    };
}

function filtersTagsDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/tags-filters.html'),
        controller: 'GlobalFiltersController'
    };
}

module.exports = {
    globalFiltersDirective: globalFiltersDirective,
    filtersTagsDirective: filtersTagsDirective
};