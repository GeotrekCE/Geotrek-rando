
// Needed to have visible popups
casper.options.viewportSize = {width: 1280, height: 768};


casper.test.begin('We can mark a place on feedback form', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        // On DOM ready.
        test.assertExists('#results #trek-2851 a.btn.search',
                          'Trek detail is present.');
        casper.click('#results #trek-2851 a.btn.search');
    });

    casper.waitForSelector('.detail-content', function() {
        test.assertExists('.detail-content a.btn.feedback',
                          'we can add a feedback for this trek');
        casper.click('.detail-content a.btn.feedback');
    });

    // Waiting popup loading
    casper.waitForSelector('#popup-feedback', function() {

    });

    // Waiting form ajax init loading
    casper.waitForSelector('#feedback-form', function() {
        test.assertExists('#feedbackmap');
        test.assertExists('#feedback-form [name="name"]', 'There is a name field');
        test.assertExists('#feedback-form [name="email"]', 'There is an email field');
        test.assertExists('#feedback-form [name="category"]', 'There is a category field');
        test.assertExists('#feedback-form [name="comment"]', 'There is a comment field');
        casper.capture('/tmp/capture.png');
    });

    // Waiting leaflet map loading
    casper.waitForSelector('#feedbackmap.ready', function() {


        // This is a little trick : to distinguish default map marker from dynamic clicked one
        // we add a class on map loaded ones...
        casper.evaluate(function() {
            $('#feedbackmap .leaflet-marker-icon').addClass('default-loaded-marker');
        });

        // ... so that, when we click on map, the new marker has not that 'default-loaded-marker' class
        casper.click('#feedbackmap');
    });

    // Waiting for marker added when clicking on feedback map
    casper.waitForSelector('#feedbackmap .leaflet-marker-icon:not(.default-loaded-marker)', function() {

        var latitude = this.getFormValues('#feedback-form').latitude;
        var longitude = this.getFormValues('#feedback-form').longitude;

        // Checking that lat/lng fields have been updated
        this.test.assertEquals(latitude != '', true);
        this.test.assertEquals(longitude != '', true);
    });

    // Testing that click on marker...
    casper.then(function() {
        casper.click('#feedbackmap .leaflet-marker-icon:not(.default-loaded-marker)');
    });

    // ... remove this marker...
    casper.waitWhileVisible('#feedbackmap .leaflet-marker-icon:not(.default-loaded-marker)', function() {

        // ... and reset lat/lng fields !
        var latitude = this.getFormValues('#feedback-form').latitude;
        var longitude = this.getFormValues('#feedback-form').longitude;

        this.test.assertEquals(latitude, '');
        this.test.assertEquals(longitude, '');
    });

    casper.run(function () {
        test.done();
    });
});
