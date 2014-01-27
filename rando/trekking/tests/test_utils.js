module.exports = (function() {

    function setUp() {
        casper.options.waitTimeout = 1000;
        casper.options.viewportSize = {width: 1280, height: 768};
        casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11');

        casper.options.timeout = 60000;
        casper.options.onTimeout = function() {
            casper.die('Timed out after 60 seconds.', 1);
        };
    }

    function clearLocalStorage () {
        // Clear localstorage for next sessions
        casper.evaluate(function () {
            localStorage.clear();
        });
    }

    function setSliderFilter(name, min, max) {
        casper.evaluate(function(name, min, max) {
            var state = {'sliders': {}};
            state['sliders'][name] = {'min': min, 'max': max};
            localStorage.setItem('filterState', JSON.stringify(state));
            window.location.hash = '';
            $(window).trigger('filters:reload');
        }, name, min, max);
    }

    function assertFilterResults(test, name, min, max, expected) {
        test.comment('Set ' + name + ' to slots ' + min + ' - ' + max);
        setSliderFilter(name, min, max);
        test.assertSelectorHasText('#tab-results span.badge', expected.length,
                                   expected.length + ' result(s).');
        for (var i=0; i<expected.length; i++) {
            var trekId = expected[i];
            test.assertNotExists("#results .result.filtered[data-id='" + trekId + "']",
                                 'Trek ' + trekId + ' was not filtered.');
        }
    }

    function done(test) {
        // For next sessions
        casper.then(clearLocalStorage);

        casper.run(function () {
            test.done();
        });
    }

    return {
        clearLocalStorage: clearLocalStorage,
        setSliderFilter: setSliderFilter,
        assertFilterResults: assertFilterResults,
        setUp: setUp,
        done: done,
    };
})();