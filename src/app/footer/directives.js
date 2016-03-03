'use strict';

function footerDirective(globalSettings) {
    var tpl       = globalSettings.FOOTER_TEMPLATE_FILE;
    var directive = {
        restrict: 'E',
        replace: true,
        scope: true,
        controller: 'FooterController'
    };

    if (tpl && tpl.length) {
        directive.templateUrl = '/app/custom/templates/' + tpl;
    } else {
        directive.template = require('./templates/default-footer.html');
    }

    return directive;
}

module.exports = {
    footerDirective: footerDirective
};
