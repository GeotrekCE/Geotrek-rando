'use strict';

function randoHeader(globalSettings) {
    var tpl       = globalSettings.HEADER_TEMPLATE_FILE;
    var directive = {
        restrict: 'E',
        replace: true,
        controller: 'headerController'
    };

    if (tpl && tpl.length) {
        directive.templateUrl = '/custom/' + tpl;
    } else {
        directive.template = require('./templates/default-header.html');
    }

    return directive;
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

function bigMenu() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/big-menu.html'),
    };
}

module.exports = {
    randoHeader: randoHeader,
    closeCollapse: closeCollapse,
    bigMenu: bigMenu,
};
