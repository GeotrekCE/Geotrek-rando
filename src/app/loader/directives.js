'use strict';

function loader() {
    return {
        restrict: 'E',
        // replace: true,
        template: require('./templates/loader.html'),
        scope: {
            loadStyle: '='
        }
    };
}

module.exports = {
    loader: loader
};
