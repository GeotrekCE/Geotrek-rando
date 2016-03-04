'use strict';

function customStyle($rootScope, configService) {
    return {
        restrict: 'E',
        controller: function() {
            configService.getCustomConfig().then(function(config) {
                if (config.colors) {
                    var styles = configService.generateColorsStyle(config.colors);
                    angular.element(document).find('head').append('<style type="text/css">' + styles + '</style>');
                }
            });
        }
    };
}

module.exports = {
    customStyle: customStyle
};
