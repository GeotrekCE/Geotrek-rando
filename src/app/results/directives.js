'use strict';

function resultsListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/results-liste.html'),
        controller: 'ResultsListeController'
    };
}

function lazyCheckDirective (resultsService) {
    return function(scope, element) {

        var method = _.throttle(resultsService.lazyCheck.bind(element), 1000);

        element.bind('scroll', method);
        if (window) { window.onresize = method; }
        setInterval(method, 3000);
    };
}



module.exports = {
    resultsListeDirective: resultsListeDirective,
    lazyCheckDirective: lazyCheckDirective
};
