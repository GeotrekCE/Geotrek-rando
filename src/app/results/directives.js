'use strict';

var controllers = require('./controllers');

function resultsListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/results-liste.html'),
        controller: controllers.ResultsListeController
    };
}

function tagsFiltersDirective() {
    return {
        restrict: 'E',
        replace: true,
        scope: true,
        template: require('./templates/tags-filters.html'),
        controller: controllers.TagsFiltersController
    };
}

module.exports = {
    resultsListeDirective: resultsListeDirective,
    tagsFiltersDirective: tagsFiltersDirective
};
