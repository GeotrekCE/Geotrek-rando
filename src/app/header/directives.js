'use strict';

function randoHeader() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/header-base.html'),
        controller: 'headerController'
    };
}

function closeCollapse() {
    return {
        restrict: 'A',
        replace: true,
        link: function(scope, elem) {
            if (window.matchMedia("(max-width: 560px)").matches) {
                elem[0].setAttribute('data-toggle', 'collapse');
                elem[0].setAttribute('data-target', '#bs-example-navbar-collapse-1');
            }
        }
    };
}

module.exports = {
    randoHeader: randoHeader,
    closeCollapse: closeCollapse
};
