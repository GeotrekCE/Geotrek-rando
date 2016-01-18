'use strict';

function itemsListDirective() {
    return {
        restrict: 'E',
        scope: {
            elements: '=',
            filterById: '=',
            type: '@'
        },
        template: require('./templates/items-list.html'),
        controller: 'ItemsListController'
    };
}

module.exports = {
    itemsListDirective: itemsListDirective
};
