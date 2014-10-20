var utils = require('../../core/tests/test_utils.js');

utils.setUp();


casper.test.begin('Trek detail shows list of POIs', function(test) {

    var detail_url = casper.cli.options['url-base'] + '/fr/boucle-du-pic-des-trois-seigneurs';

    casper.start(detail_url, function () {
        test.assertSelectorHasText('#detail-content-title .title',
                                   "Découverte de la Cascade d'Ars",
                                   'Title is shown');
        casper.waitForSelector('.toggle-layer.pois');
    });

    casper.then(function () {
        test.assertExists('.toggle-layer.pois.active',
            'POI layer switcher is active.');
    });

    utils.done(test);

});
