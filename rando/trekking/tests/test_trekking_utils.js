module.exports = (function() {

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
        test.assertSelectorHasText('#results .number .badge', expected.length,
                                   expected.length + ' result(s).');
        for (var i=0; i<expected.length; i++) {
            var trekId = expected[i];
            test.assertNotExists("#results .result.filtered[data-id='" + trekId + "']",
                                 'Trek ' + trekId + ' was not filtered.');
        }
    }

    return {
        setSliderFilter: setSliderFilter,
        assertFilterResults: assertFilterResults,
    };
})();