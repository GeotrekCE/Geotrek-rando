var utils = require('../../core/tests/test_utils.js');


utils.setUp();


casper.test.begin('Welcome popup is always shown when forced', function(test) {

    var home_url = casper.cli.options['url-base'] + "/fr/";

    /*
     * Landing on home
     */

    casper.start(home_url, function () {
        // On DOM ready.
        test.assertExists("header a.home.popup",
                          'Link to show popup is present');
    });

    casper.waitUntilVisible('#popup-home', function () {
        test.pass('Popup is shown by default.');
        casper.click('#popup-home button.close');
    });

    casper.waitWhileVisible('#popup-home', function () {
        test.assertExists("#popup-home[aria-hidden='true']",
                          'Popup is now closed.');
        test.info('Come back on home');
    });

    casper.thenOpen(home_url, function () {
        casper.waitForSelector("#popup-home");
    });

    casper.then(function () {
        test.pass('Popup is shown on second visit.');
    });

    casper.then(utils.clearLocalStorage);

    /*
     * Landing on other page than home
     */
    casper.then(function () {
        test.info('Open detail page');
        casper.open(home_url + 'pages/flatpage');
    });

    casper.waitForSelector("#popup-home", function () {
        test.pass('Popup is shown if landing on other page.');
    });

    utils.done(test);
});
