'use strict';

function customStyle(configService) {
    return {
        restrict: 'E',
        controller: function() {
            configService.getCustomConfig().then(function(config) {
                if (config.colors) {
                    var styles = configService.generateColorsStyle(config.colors);
                    angular.element(document).find('head').prepend('<style type="text/css">' + styles + '</style>');
                }
            });
        }
    };
}

module.exports = {
    customStyle: customStyle
};
