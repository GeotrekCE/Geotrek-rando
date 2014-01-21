var helper = require('./djangocasper.js');

casper.on('remote.message', function(message) {
    this.echo('remote message caught: ' + message);
});
casper.on('page.error', function(message) {
    this.echo('remote error caught: ' + message);
});
casper.on('exit', function(message) {
    this.evaluate(function () {
        localStorage.clear();
    });
});


casper.options.waitTimeout = 1000;
casper.options.viewportSize = {width: 1280, height: 768};
casper.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11");


casper.test.begin('Welcome popup is only shown the first time', function(test) {

    var home_url = 'http://localhost:8081/fr/';

    casper.start();

    casper.then(function () {
        casper.evaluate(function () {
            localStorage.clear();
        });
    });

    casper.thenOpen(home_url, function () {
        // On DOM ready.
        casper.test.assertExists('#flatpages li.home',
                                 'Popup button is present');
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
        casper.click('#flatpages li.home');
    }, 500);

    casper.waitUntilVisible('#popup-home', function () {
        casper.test.assertExists("#popup-home[aria-hidden='false']",
                                 'Popup still opens on mav button.');
    });

    casper.run(function () {
        test.done();
    });
});
