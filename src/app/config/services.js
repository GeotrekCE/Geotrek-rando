'use strict';

function configService($http, $filter, settingsFactory, translationService) {

    this.getCustomConfig = function getCustomConfig() {
        var currentLang = translationService.getCurrentLang();
        var url = settingsFactory.configUrl.replace(/\$lang/, currentLang);

        return $http({url: url})
            .then(function (response) {
                return response.data;
            });
    };

    this.generateColorsStyle = function getCustomConfig(colors) {
        var styles = '';

        if (colors.categories) {
            _.forIn(colors.categories, function(color, category) {
                var colorCSS = {
                    selector: '.category-' + category + '-c',
                    rules: [
                        'color:' + color
                    ]
                };
                var backgroundCSS = {
                    selector: '.category-' + category + '-bg',
                    rules: [
                        'background-color:' + color
                    ]
                };
                var backgroundOpacityCSS = {
                    selector: '.category-' + category + '-bgo',
                    rules: [
                        'background-color:' + 'rgba(' + $filter('hexToRgb')(color) + ', .5)'
                    ]
                };

                styles += colorCSS.selector + '{' + colorCSS.rules.join(';') + '} ';
                styles += backgroundCSS.selector + '{' + backgroundCSS.rules.join(';') + '} ';
                styles += backgroundOpacityCSS.selector + '{' + backgroundOpacityCSS.rules.join(';') + '} ';
            });
        }

        if (colors.main) {

        }

        return styles;
    };
}

module.exports = {
    configService: configService
};
