var utils = require('../../core/tests/test_utils.js');
var trekking_utils = require('./test_trekking_utils.js');

utils.setUp();


casper.test.begin('Treks can be filtered by altitude', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
    });

    casper.then(function () {
        trekking_utils.assertFilterResults(test, 'altitude', 0, 0, [2851]);
    });

    casper.then(function () {
        trekking_utils.assertFilterResults(test, 'altitude', 1, 2, [2]);
    });

    casper.then(function () {
        trekking_utils.assertFilterResults(test, 'altitude', 2, 3, [2849]);
    });

    utils.done(test);
});
