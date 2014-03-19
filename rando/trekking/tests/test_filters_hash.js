var utils = require('./test_utils.js');

utils.setUp();


casper.test.begin('Filters location hash', function(test) {

    var home_url = casper.cli.options['url-base'] + '/fr/',
        filter_duration_1day = '#3782-20ce-360-9602-60a6-273-805-ca18-15c1-430-b94-7b0-ed5-5005-b284-9404-6006-8433-b003-d56a-5f0-e800-',
        filter_ascent_600m = '#3782-20ce-360-9602-60a6-273-805-ca02-1840-2e52-c15d-e554-16c-a00e-d501-1801-a118-f400-f2a0-5f56-8000-';

    casper.start(home_url, function () {
        utils.clearLocalStorage();
    });

    casper.thenOpen(home_url, function () {
        test.assertSelectorHasText('#tab-results span.badge', 3,
                                   'Test catalog has 3 treks');
        casper.wait(4000);
    });

    casper.thenOpen(home_url + filter_ascent_600m, function () {
        test.assertSelectorHasText('#tab-results span.badge', 1,
                                   'Filters state is loaded from hash on page load.');
    });

    casper.then(function () {
        test.assertUrlMatch(filter_ascent_600m,
                            'Location hash is maintained after page load');
        utils.setSliderFilter('difficulty', 0, 0);
        test.assertUrlMatch(/#3782-20ce-360-9602-60a6-273-805-ca19-4066-9a81-8c0a-e100-2e02-7aaa-b6-5007-6a80-c00-d081-4086-7b-d02f-b740-$/,
                            'Location hash is refreshed on filter change');
    });

    casper.then(function () {
        casper.evaluate(function (hash) {
            window.location.hash = hash;
        }, filter_duration_1day);
        test.assertSelectorHasText('#tab-results span.badge', 1,
                                   'Filters state is refreshed on hash change');

        casper.click('#clear-filters');
    });

    casper.then(function () {
        test.assertUrlMatch(/#$/,
                            'Location hash is cleared on filter clear');
    });

    utils.done(test);

});
