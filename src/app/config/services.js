'use strict';

function configService($http, $filter, settingsFactory, translationService) {

    this.isConfigAvailable = function(){
        // Variable to test if Json file is available - for development
        // May be removed when all configs are ready
        return true;
    };

    this.getCustomConfig = function getCustomConfig() {
        var currentLang = translationService.getCurrentLang();
        var url = settingsFactory.configUrl.replace(/\$lang/, currentLang);

        return $http({url: url})
            .then(function (response) {
                return response.data;
            }, function(err) {
                console.error(err);
            });
    };

    this.generateColorsStyle = function getCustomConfig(colors) {
        var styles = '';
        var tinycolor = require("tinycolor2");

        if (colors.categories) {
            _.forIn(colors.categories, function(color, category) {

                var opacity05 = tinycolor(color).setAlpha(0.5).toRgbString();
                var lightenDesaturate = tinycolor(color).lighten(20).desaturate(20);
                var darken = tinycolor(color).darken(25);

                var categoriesCSS =  [
                    {
                        selector: '.category-' + category + '-c',
                        rules: ['color:' + color]
                    },
                    {
                        selector: '.category-' + category + '-border',
                        rules: ['border-color:' + color]
                    },
                    {
                        selector: '.category-' + category + '-bg, .category-' + category + '-bg-ld:hover',
                        rules: ['background-color:' + color]
                    },
                    {
                        selector: '.category-' + category + '-bgo',
                        rules: ['background-color:' + opacity05]
                    },
                    {
                        selector: '.category-' + category + '-stroke',
                        rules: ['stroke:' + color]
                    },
                    {
                        selector: '.category-' + category + ' .marker .base',
                        rules: ['fill:' + color]
                    },
                    {
                        selector: '.category-' + category + '-bg-ld',
                        rules: ['background-color:' + lightenDesaturate]
                    },
                    {
                        selector: '.category-' + category + '-fill-darken',
                        rules: ['color:' + darken]
                    }
                ];

                _.forEach(categoriesCSS, function(CSS) {
                    styles += CSS.selector + '{' + CSS.rules.join(';') + '} ';
                });
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
