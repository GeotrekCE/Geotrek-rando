(function (window) {
    'use strict';

    $(window).on('map:init', function (e) {
        $.getJSON('/fr/files/api/datasource/datasources.json', function (data) {
            console.log(data);
        });
    });
})(window);