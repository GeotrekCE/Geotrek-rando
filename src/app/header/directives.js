'use strict';

var controllers = require('./controllers');

function randoHeader() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/header-base.html'),
        controller: controllers.headerController
    };
}

module.exports = {
    randoHeader: randoHeader
};