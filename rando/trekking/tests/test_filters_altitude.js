var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be filtered by altitude', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
    });

    casper.then(function () {
        utils.assertFilterResults(test, 'altitude', 0, 0, [2851]);
    });

    casper.then(function () {
        utils.assertFilterResults(test, 'altitude', 1, 2, [2]);
    });

    casper.then(function () {
        utils.assertFilterResults(test, 'altitude', 2, 3, [2849]);
    });

    utils.done(test);
});
