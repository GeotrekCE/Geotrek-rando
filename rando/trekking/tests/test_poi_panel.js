var utils = require('../../core/tests/test_utils.js');

utils.setUp();


casper.test.begin('Trek detail shows list of POIs', function(test) {

    var detail_url = casper.cli.options['url-base'] + '/fr/boucle-du-pic-des-trois-seigneurs';

    casper.start(detail_url, function () {
        test.assertSelectorHasText('#detail-content-title .title',
                                   "Boucle du Pic des Trois Seigneurs",
                                   'Title is shown');
        // Wait for map ready
        casper.waitForSelector('.leaflet-control-minimap-toggle-display');
    });

    casper.then(function () {
        // Activate map
        casper.click('#detailmap');
        casper.waitForSelector('.toggle-layer.pois');
    });

    casper.then(function () {
        test.assertExists('.toggle-layer.pois.active',
            'POI layer switcher is active.');

        test.info('Trek with no POI');
    });


    var no_poi_detail_url = casper.cli.options['url-base'] + '/fr/decouverte-de-la-cascade-dars';

    casper.thenOpen(no_poi_detail_url, function () {
        // Wait for map ready
        casper.waitForSelector('.leaflet-control-minimap-toggle-display');
    });

    casper.then(function () {
        // Activate map
        casper.click('#detailmap');
        casper.waitForSelector('.toggle-layer.satellite');
    });

    casper.then(function () {
        test.assertNotExists('.toggle-layer.pois',
            'POI layer switcher is not present if no POI.');
    });

    utils.done(test);

});
