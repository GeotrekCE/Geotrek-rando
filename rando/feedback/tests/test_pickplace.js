var utils = require('./test_utils.js');

utils.setUp();

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
    });

    // Waiting leaflet map loading
    casper.waitForSelector('#feedbackmap.ready', function() {
        
        // This is a little trick : to distinguish default map marker than dynamic clicked one
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
        
        // Checking delta between 2 lat/lng positions
        this.test.assertEquals(latitude != '', true);
        this.test.assertEquals(longitude != '', true);
    });

    utils.done(test);
});
