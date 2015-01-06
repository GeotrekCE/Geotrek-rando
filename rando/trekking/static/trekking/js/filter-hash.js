$(document).ready(function() {

    // On page load, load filters from hash
    hashToFilter();

    // On hash change (ex: from popup links)
    var watch = true;
    $(window).on('hashchange', function() {
        if (watch) {
            hashToFilter();
        }
    });

    // On filter change
    $(window).on('filters:changed', filterToHash);



    function hashToFilter() {
        var hash = window.location.hash.slice(1);
        // Try to load from hash
        try {
            if (hash.length > 0) {
                var hexhash = hexToString(hash);
                var serialized = LZString.decompress(hexhash);
            } else {
                var serialized = null;
            }
            localStorage.setItem('filterState', serialized);
            $(window).trigger('filters:reload');
        }
        catch (err) {}
    }

    function filterToHash() {
        var serialized = localStorage.getItem('filterState');
        if (serialized === null) {
            return;
        }
        if (serialized == '{}')
            serialized = '';

        // Refresh URL hash, so that users can copy and paste URLs with filters
        var compressed = LZString.compress(serialized);
        if (!/backpack/.test(window.location.hash)) {
            watch = false;
            window.location.replace('#' + (serialized.length > 0 ? stringToHex(compressed) : ''));
            watch = true;
        }
    }

    /**
     * Helper functions for string <--> hexadecimal
     */
    function d2h(d) {
        return d.toString(16);
    }
    function h2d (h) {
        return parseInt(h, 16);
    }
    function stringToHex (tmp) {
        var str = '',
            i = 0,
            tmp_len = tmp.length,
            c;
        for (; i < tmp_len; i += 1) {
            c = tmp.charCodeAt(i);
            str += d2h(c) + '-';
        }
        return str;
    }
    function hexToString (tmp) {
        var arr = tmp.split('-'),
            str = '',
            i = 0,
            arr_len = arr.length,
            c;
        for (; i < arr_len; i += 1) {
            c = String.fromCharCode( h2d( arr[i] ) );
            str += c;
        }
        return str;
    }

});
