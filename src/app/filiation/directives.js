'use strict';

var controllers = require('./controllers');

function ChildrenListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/children-list.html'),
        controller: controllers.FiliationController
    };
}

function ParentListeDirective() {
    return {
        restrict: 'E',
        replace: true,
        //scope: false,
        template: require('./templates/parent-list.html'),
        controller: controllers.FiliationController
    };
}

module.exports = {
    ChildrenListeDirective: ChildrenListeDirective,
    ParentListeDirective: ParentListeDirective
};
