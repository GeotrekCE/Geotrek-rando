'use strict';

function randoHeader() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/header-base.html'),
        controller: 'headerController'
    };
}

module.exports = {
    randoHeader: randoHeader
};
