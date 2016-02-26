'use strict';

function loader() {
    return {
        restrict: 'E',
        replace: true,
        template: require('./templates/loader.html'),
        scope: {
            loadClass: '='
        }
    };
}

module.exports = {
    loader: loader
};
