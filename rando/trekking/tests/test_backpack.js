var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be added and removed from backpack', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    /*
     * Landing on home
     */

    casper.start(home_url, function () {
        // On DOM ready.
        casper.test.assertExists("#backpack",
                                 'Backpack tab is present.');
    });

    utils.done(test);
});
