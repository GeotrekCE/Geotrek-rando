'use strict';

function itemsListDirective() {
    return {
        restrict: 'E',
        scope: {
            elements: '=',
            type: '@'
        },
        template: require('./templates/items-list.html'),
        // controller: function() {
        //     console.log('test');
        // }
        // controller: 'ResultsListeController'
        controller: 'ItemsListController'
    };
}

module.exports = {
    itemsListDirective: itemsListDirective
};
