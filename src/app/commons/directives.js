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

function clickAnywhereButHere($document) {
    return {
        restrict: 'A',
        link: function(scope, elem, attr) {
          elem.bind('click', function(e) {
            // this part keeps it from firing the click on the document.
            e.stopPropagation();
          });
          $document.bind('click', function() {
            // magic here.
            scope.$apply(attr.clickAnywhereButHere);
        });
        }
    };
}


module.exports = {
    a: a,
    clickAnywhereButHere: clickAnywhereButHere
};
