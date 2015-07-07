'use strict';

function detailDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-page.html'),
        controller: 'DetailController'
    };
}

module.exports = {
    detailDirective: detailDirective
};
