'use strict';

function rando3dDirective() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/rando-3d.html'),
        controller: 'Rando3DController'
    };
}

module.exports = {
    rando3dDirective: rando3dDirective
};
