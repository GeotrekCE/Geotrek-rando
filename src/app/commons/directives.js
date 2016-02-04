'use strict';

function a() {
    // This function prevent the browser from navigating to #
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
                elem.on('click', function(e){
                    e.preventDefault();
                });
            }
        }
    };
}

module.exports = {
    a: a
};
