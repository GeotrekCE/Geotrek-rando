'use strict';

function ChildrenListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/children-list.html'),
        controller: 'FiliationController'
    };
}

function ParentListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/parent-list.html'),
        controller: 'FiliationController'
    };
}

module.exports = {
    ChildrenListeDirective: ChildrenListeDirective,
    ParentListeDirective: ParentListeDirective
};
