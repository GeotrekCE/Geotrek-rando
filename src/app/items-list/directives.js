'use strict';

function itemsListDirective() {
    return {
        restrict: 'E',
        scope: {
            elements: '=',
            filter: '=',
            type: '@'
        },
        template: require('./templates/items-list.html'),
        controller: 'ItemsListController'
    };
}

module.exports = {
    itemsListDirective: itemsListDirective
};
