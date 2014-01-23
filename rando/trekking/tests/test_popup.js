var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Welcome popup is only shown the first time', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    /*
     * Landing on home
     */

    casper.start(home_url, function () {
        // On DOM ready.
        casper.test.assertExists("header a.home.popup",
                                 'Link to show popup is present');
    });

    casper.waitUntilVisible('#popup-home', function () {
        casper.test.comment('Popup is shown by default.');
        casper.click('#popup-home button.close');
    });

    casper.waitWhileVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='true']",
                                 'Popup is now closed.');
    });

    casper.then(function () {
        casper.test.comment('Come back on home');
        casper.open(home_url);
    });

    casper.waitUntilVisible('#popup-home', undefined, function () {
        casper.test.comment('Popup is not shown on second visit.');
        casper.click('header a.home.popup');
    }, 200);

    casper.waitUntilVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='false']",
                                 'Popup still opens on button click.');
    });

    casper.then(utils.clearLocalStorage);

    /*
     * Landing on other page than home
     */
    casper.then(function () {
        casper.test.comment('Open detail page');
        casper.open(home_url + 'pages/flatpage');
    });

    casper.waitUntilVisible('#popup-home', undefined, function () {
        casper.test.assertExists("#popup-home[aria-hidden='true']",
                                 'Popup is not shown if landing on other page.');

        casper.click('header a.home');
    }, 200);

    casper.waitUntilVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='false']",
                                 'Popup opens on button click.');
        casper.test.assertUrlMatch(/fr\/#results$/, 'And home page is shown.');
    });

    utils.done(test);
});
