var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be filtered by duration', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
    });

    casper.then(function () {
        casper.click('#popup-home button.close');
        checkResults(0, 0, [2849]);
    });

    casper.then(function () {
        checkResults(1, 1, [2]);
    });

    casper.then(function () {
        checkResults(2, 2, [2851]);
    });

    casper.then(function () {
        checkResults(0, 2, [2849, 2, 2851]);
    });

    casper.then(function () {
        checkResults(0, 1, [2849, 2]);
    });

    casper.then(function () {
        checkResults(1, 2, [2, 2851]);
    });

    utils.done(test);


    function checkResults(min, max, expected) {
        test.comment('Set duration to slots ' + min + ' - ' + max);
        setFilterDuration(min, max);
        test.assertSelectorHasText('#tab-results span.badge', expected.length,
                                   expected.length + ' result(s).');
    }


    function setFilterDuration(min, max) {
        casper.evaluate(function(min, max) {
            var state = JSON.stringify({"sliders":{"duration":{"min": min,"max": max}}});
            localStorage.setItem('filterState', state);
            window.location.hash = '';
            $(window).trigger('filters:reload');
        }, min, max);
    }
});
