'use strict';

var controllers = require('./controllers');

function detailDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/detail-page.html'),
        controller: controllers.DetailController
    };
}

module.exports = {
    detailDirective: detailDirective
};