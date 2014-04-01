// Needed to have visible popups
casper.options.viewportSize = {width: 1280, height: 768};

casper.test.begin('Tourism Layers', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
         casper.waitForSelector('.tourism-layer-switcher');

    });

    casper.then(function() {
    casper.capture('/tmp/capture.png');
        test.pass('Tourism layer switcher is present');

        test.assertNotExists('.leaflet-marker-icon.tourism',
                             'Markers are not shown by default.');

        casper.click('.toggle-layer:first-child');
    });

    casper.then(function () {
        test.assertExists('.toggle-layer.active',
                          'Layer toggle is shown active on click');

        test.assertExists('.leaflet-marker-icon.tourism',
                          'Markers are shown on click.');
    });

    casper.run(function () {
        test.done();
    });
});
