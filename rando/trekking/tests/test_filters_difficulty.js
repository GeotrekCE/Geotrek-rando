var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be filtered by difficulty', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
    });

    casper.then(function () {
        checkResults(1, 1, [2849]);
    });

    casper.then(function () {
        checkResults(1, 4, [2849, 2, 2851]);
    });

    utils.done(test);


    function checkResults(min, max, expected) {
        test.comment('Set difficulty to slots ' + min + ' - ' + max);
        utils.setSliderFilter('difficulty', min, max);
        test.assertSelectorHasText('#tab-results span.badge', expected.length,
                                   expected.length + ' result(s).');
    }

});
