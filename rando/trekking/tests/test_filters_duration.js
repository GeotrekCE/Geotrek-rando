var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be filtered by duration', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
        setFilterDuration(2, 2);
    });

    casper.waitForSelectorTextChange('#tab-backpack span.badge', function () {
        test.assertSelectorHasText('#tab-results span.badge', 1,
                                   'Was reduced to one trek');
    });

    utils.done(test);


    function setFilterDuration(min, max) {
        casper.evaluate(function(min, max) {
            var state = JSON.stringify({"sliders":{"duration":{"min": min,"max": max}}});
            localStorage.setItem('filterState', state);
            window.location.hash = '';
            $(window).trigger('filters:reload');
        }, min, max);
    }
});
