var utils = require('../../core/tests/test_utils.js');

utils.setUp();


casper.test.begin('Tourism Layers', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        utils.clearLocalStorage();
        casper.waitForSelector('.simple-layer-switcher.tourism', function(){}, function (){casper.capture('/tmp/capture-tourism.png');});
    });

    casper.then(function() {
        test.pass('Tourism layer switcher is present');
        casper.capture('/tmp/step1.png');
        test.assertElementCount('.simple-layer-switcher.tourism .toggle-layer', 2,
                                'One layer switcher by datasource.');
        test.assertNotExists('.toggle-layer.active',
                             'No layer switcher is active by default.');

        test.assertNotExists('.leaflet-marker-icon.tourism',
                             'Markers are not shown by default.');

        casper.click('.toggle-layer:first-child');

        casper.waitForSelector('.leaflet-marker-icon.tourism');
    });

    casper.then(function () {
        test.assertExists('.toggle-layer.active',
                          'Layer toggle is shown active on click');

        test.assertExists('.leaflet-marker-icon.tourism',
                          'Markers are shown on click.');

        casper.click('.leaflet-marker-icon.tourism');
        casper.waitForSelector('.leaflet-popup');
    });

    casper.then(function () {
        test.pass('Popup is shown on marker click');

        test.comment('Open detail page');
        casper.click("a.btn.search");
        casper.waitForSelector('#detailmap .toggle-layer');
    });

    casper.then(function () {
        test.pass('Tourism markers are still shown on map');
        casper.waitForSelector('#detailmap .leaflet-marker-icon.tourism');
    });

    casper.then(function () {
        test.pass('Markers state is restored.');
    });

    utils.done(test);
});
