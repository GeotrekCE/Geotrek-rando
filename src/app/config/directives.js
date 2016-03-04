'use strict';

function customStyle($rootScope, stylesConfigService) {
    return {
        restrict: 'E',
        controller: function() {
            if (stylesConfigService.isConfigAvailable()) {
                stylesConfigService.getCustomConfig().then(function(config) {
                    if (config.colors) {
                        var styles = stylesConfigService.generateColorsStyle(config.colors);
                        angular.element(document).find('head').append('<style type="text/css">' + styles + '</style>');
                    }
                });                
            }
        }
    };
}

module.exports = {
    customStyle: customStyle
};
