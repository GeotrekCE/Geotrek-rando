var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Welcome popup is only shown the first time', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

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
    });

    casper.then(function () {
        test.info('Come back on home');
        casper.open(home_url);
    });

    casper.waitForSelector("#popup-home[aria-hidden='true']", function () {
        test.pass('Popup is not shown on second visit.');
        casper.click('header a.home.popup');
    });

    casper.waitUntilVisible('#popup-home', function () {
        test.assertExists("#popup-home[aria-hidden='false']",
                          'Popup still opens on button click.');
    });

    casper.then(utils.clearLocalStorage);

    /*
     * Landing on other page than home
     */
    casper.then(function () {
        test.info('Open detail page');
        casper.open(home_url + 'pages/flatpage');
    });

    casper.waitForSelector("#popup-home[aria-hidden='true']", function () {
        test.pass('Popup is not shown if landing on other page.');
        casper.click('header a.home'); // Brings to home
    });

    casper.waitForSelector('header li.home a', function () {
        casper.click('header li.home a');
    });

    casper.waitUntilVisible('#popup-home', function () {
        test.assertExists("#popup-home[aria-hidden='false']",
                          'Popup opens on button click.');
        test.assertUrlMatch(home_url, 'And home page is shown.');
    });

    utils.done(test);
});
