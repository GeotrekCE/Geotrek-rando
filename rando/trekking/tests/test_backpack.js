var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Treks can be added and removed from backpack', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/';

    casper.start(home_url, function () {
        // On DOM ready.
        test.assertExists('#tab-backpack',
                          'Backpack tab is present.');
        test.assertElementCount('#results .result', 3,
                                'Test catalog has 3 treks');

        test.info('Add trek to backpack');
        casper.click('#results #trek-2851 a.btn.backpack');
    });

    casper.waitForSelectorTextChange('#tab-backpack span.badge', function () {
        // Once added
        test.assertSelectorHasText('#tab-backpack span.badge', 1,
                                   'Trek was added to backpack');

        test.assertExists('#results #trek-2851 a.btn.backpack.active',
                          'Result backpack button is toggled.');
        test.assertExists('#results #trek-2851 a.btn.backpack.icon-backpack-remove',
                          'Result backpack button has remove icon.');

        test.assertExists('#backpack #backpack-trek-2851 a.btn.backpack.active',
                          'Backpack button is toggled.');
        test.assertExists('#backpack #backpack-trek-2851 a.btn.backpack.icon-backpack-remove',
                          'Backpack button has remove icon.');
    });

    casper.then(function () {
        test.info('Come back on home');
        casper.open(home_url);
    });

    casper.waitForSelectorTextChange('#tab-backpack span.badge', function () {
        test.assertSelectorHasText('#tab-backpack span.badge', 1,
                                   'Trek is still in backpack');

        test.info('Go to detail');
        casper.click('#results #trek-2851 a.btn.search');
    });

    casper.waitForSelector('#toolbox a.btn.backpack.active', function () {
        test.info('Remove trek from backpack');
        casper.click('#toolbox a.btn.backpack.active');
    });

    casper.waitForSelectorTextChange('#tab-backpack span.badge', function () {
        // Once removed
        test.assertSelectorHasText('#tab-backpack span.badge', 0,
                                   'Trek was removed from backpack');

        test.info('Add it from detail');
        casper.click('#toolbox a.btn.backpack');
        test.info('Go to home');
        casper.click('header a.home');
    });

    casper.waitForSelector('#results #trek-2851.result', function () {
        test.assertExists('#results #trek-2851 a.btn.backpack.active',
                          'Result backpack button is toggled.');
    });

    utils.done(test);
});
