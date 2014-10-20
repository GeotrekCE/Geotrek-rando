var utils = require('../../core/tests/test_utils.js');

utils.setUp();


casper.test.begin('Trek detail shows list of POIs', function(test) {

    var detail_url = casper.cli.options['url-base'] + '/fr/boucle-du-pic-des-trois-seigneurs';

    casper.start(detail_url, function () {
        // Wait for map ready
        casper.waitForSelector('.leaflet-control-minimap-toggle-display');
    });

    casper.then(function () {
        test.assertNotExists('leaflet-sidebar.right.visible',
            'POI panel is not shown');

        // Activate map
        casper.click('#detailmap');

        casper.waitForSelector('.toggle-layer.pois');
    });

    casper.then(function () {
        test.assertNotExists('.toggle-layer.pois.active',
            'POI layer switcher is inactive.');

        // Activate POIs
        casper.click('.toggle-layer.pois');
        casper.waitForSelector('.leaflet-sidebar.right.visible');
    });

    casper.then(function () {
        test.assertExists('.toggle-layer.pois.active',
            'POI layer switcher is now active.');
        test.assertSelectorHasText('#pois-sidebar h5',
                                   "Sur le chemin…",
                                   'POI side panel is shown');

        test.assertSelectorHasText("#pois-sidebar .poi[data-pk='2867'] .name",
                                   "Pic des Trois Seigneurs",
                                   'POI names are shown');
    });

    utils.done(test);

});
