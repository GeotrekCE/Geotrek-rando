casper.options.waitTimeout = 1000;
casper.options.viewportSize = {width: 1280, height: 768};
casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11");


casper.test.begin('Welcome popup is only shown the first time', function(test) {

    var home_url = 'http://localhost:8081/fr/';


    /*
     * Landing on home
     */

    casper.start(home_url, function () {
        // On DOM ready.
        casper.test.assertExists("header a.home.popup",
                                 'Link to show popup is present');
    });

    casper.waitUntilVisible('#popup-home', function () {
        casper.click('#popup-home button.close');
    });

    casper.waitWhileVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='true']",
                                 'Popup is now closed.');
    });

    casper.log('Come back on home');
    casper.open(home_url);

    casper.waitUntilVisible('#popup-home', undefined, function () {
        casper.test.assertExists("#popup-home[aria-hidden='true']",
                                 'Popup is not shown on second visit.');
        casper.click('header a.home.popup');
    }, 200);

    casper.waitUntilVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='false']",
                                 'Popup still opens on button click.');
    });

    casper.then(clearLocalStorage);

    /*
     * Landing on other page than home
     */

    casper.log('Open detail page');
    casper.open(home_url + 'pages/flatpage');
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



    casper.then(clearLocalStorage);  // For next sessions

    casper.run(function () {
        test.done();
    });



    function clearLocalStorage () {
        // Clear localstorage for next sessions
        casper.evaluate(function () {
            localStorage.clear();
        });
    }
});
