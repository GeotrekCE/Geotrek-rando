(function () {

$(window).on('view:mobile', init_mobile);
$(window).on('view:home', view_home);
$(window).on('view:detail', view_detail);
$(window).on("filters:changed", function(e, visible) {
    refresh_results(visible);
});


function view_home() {
    window.trekFilter.setup();

    // Load filters (will refresh backpack results)
    // (After sliders initialization)
    var treksList = [];
    $('#results .result').each(function () {
        var $trek = $(this),
            trek = [];
        $.each(['fulltext', 'themes', 'usages', 'districts', 'cities',
                'route', 'difficulty', 'duration', 'ascent', 'id'], function (i, k) {
            trek[k] = $trek.data(k);
        });
        treksList.push(trek);
    });
    window.trekFilter.load(treksList);

    $('#clear-filters').off('click').on('click', function () {
        $(window).trigger('filters:clear');
    });

    $("#mainmap").show();  // We are on home with map
    invalidate_maps();

    // Focus search field
    if (/search/.test(window.location.hash)) {
        $('input#search').focus();
    }

    $('#toggle-side-bar').off('click').on('click', function () {
        var animDuration = 700,
            $toggleControl = $(this);
        if (!$toggleControl.hasClass('closed')) {
            var width_sidebar = $('.side-bar').width() - $toggleControl.width();
            $('#side-bar').animate({left : -width_sidebar+'px'}, animDuration, 'easeInOutExpo');
        }
        else {
            $('#side-bar').animate({left:'0'}, animDuration, 'easeInOutExpo');
        }
        setTimeout(function onSideBarToggled() {
            $toggleControl.toggleClass('closed');
            $('#side-bar').toggleClass('closed');
            $('#mainmap').toggleClass('fullwidth');
        }, animDuration/2);
    });

    // Highlight map on hover in sidebar results
    $('#side-bar .result').hover(function() {
        $(window).trigger('trek:highlight', [$(this).data('id'), true]);
    },
    function() {
        $(window).trigger('trek:highlight', [$(this).data('id'), false]);
    });

    $('#side-bar .result').on('dblclick', function (e) {
        e.preventDefault();
        // Simulate click on search
        $('a.search', this).click();
        // Track event
        _gaq.push(['_trackEvent', 'Results', 'Doubleclick', $(this).data('name')]);
    });

    // Click on side-bar
    $('#side-bar .result').on('click', function (e) {
        // Do not fire click if clicked on search tools
        if ($(e.target).parents('.search-tools').length === 0) {
            e.preventDefault();
            $(window).trigger('trek:showpopup', [$(this).data('id')]);
            // Track event
            _gaq.push(['_trackEvent', 'Results', 'Click', $(this).data('name')]);
        }
        // else, normal click on search tools buttons
    });

    // Tooltips on theme/usages and pictogram list
    $('.pictogram').tooltip({container:'body'});
}


function refresh_results(matching) {
    $('#results .result').each(function () {
        var $trek = $(this),
            trekId = $trek.data('id');
        if ($.inArray(trekId, matching) != -1) {
            $trek.removeClass('filtered').show(200);
        }
        else {
            $trek.addClass('filtered').hide(200);
        }
    });
    if (matching.length > 0)
        $('#noresult').hide(200);
    else
        $('#noresult').show(200);
    // Refresh label with number of results
    $('#tab-results span.badge').html(matching.length);
}


function view_detail() {
    $("#mainmap").hide();  // We are elsewhere

    if (!MOBILE) {
        if (typeof(loadmapdetailmap) == "function") {
            // Detail map is not present on flatpages
            loadmapdetailmap();
        }
    }
    else {
        $('#detailmap #staticmap').removeClass('hidden');
        $('#detailmap .helpclic').hide();
    }

    $('#tab-results span.badge').html(window.trekFilter.getResultsCount());

    // Cycle Trek carousel automatically on start
    if (!MOBILE) {
        $('#trek-carousel .carousel').carousel('cycle');
    }

    //Load altimetric graph
    if ($('#altitudegraph').length > 0) {
        var jsonurl = $('#altitudegraph').data('url');
        altimetricInit(jsonurl);
    }

    // Tooltips
    $('#usages div, #themes div').tooltip();
    $('#trek-identity .info').tooltip();
    $('a.print.disabled').tooltip({placement: 'left'});

    // Load Disqus thread (if enabled)
    if (window.DISQUS) {
        var $container = $('#disqus_thread');
        DISQUS.reset({
          reload: true,
          config: function () {
            this.page.identifier = $container.data('disqus-identifier');
            this.page.title = $container.data('disqus-title');
            this.page.url = $container.data('disqus-url');
            this.language = $container.data('disqus-language');
          }
        });
    }
}

function altimetricInit(jsonurl) {
    /*
     * Load altimetric profile from JSON
     */
    $.getJSON(jsonurl, function(data) {
        function updateSparkline() {
            $('#profilealtitude').sparkline(data.profile, L.Util.extend({
                tooltipSuffix: ' m',
                numberDigitGroupSep: '',
                width: '100%',
                height: 100
            }, ALTIMETRIC_PROFILE_OPTIONS));
        }

        updateSparkline();

        $(window).smartresize(function() {
            updateSparkline();
        });

        $('#profilealtitude').bind('sparklineRegionChange', function(ev) {
            var sparkline = ev.sparklines[0],
                region = sparkline.getCurrentRegionFields();
                value = region.y;
            $('#mouseoverprofil').text(Math.round(region.x) +"m");
            // Trigger global event
            $('#profilealtitude').trigger('hover:distance', region.x);
        }).bind('mouseleave', function() {
            $('#mouseoverprofil').text('');
            $('#profilealtitude').trigger('hover:distance', null);
        });

    });
}


function init_mobile() {
    // Remove desktop specific events
    $('#side-bar .result').off('dblclick mouseenter mouseleave');

    // Clear search on cross click
    $('#text-search .navbar-search').click(function (e) {
        if ($(e.target).hasClass('clear')) {
            $(window).trigger('filters:clear');
        }
    });

    // Show search tab
    $('#search').on('focus', function (e) {

        // Reset button when searching (trigger closing of mobile keyboard)
        $('#text-search .navbar-search div').removeClass('icon-search').addClass('clear icon-fontawesome-webfont-1').one('click', function (e) {
            $('#search').blur();
        });

        $('#results').show();
        $(document).on('click.results', function (e) {
            if ($('#search').has(e.target).length === 0 && e.target != $('#search')[0]) {
                $('#results').hide();
                $(document).off('click.results');
            }
        });
    });

    var resultTaped = false;

    $('#search').on('blur', function (e) {
        // Prevent result list hiding on blur
        if(resultTaped) {
            $(this).focus();
            resultTaped = false;
        } else {
            $('#text-search .navbar-search div').removeClass('icon-fontawesome-webfont-1').addClass('icon-search').off('click');
            $('#results').hide();
            $(document).off('click.results');
        }
    });

    $('#side-bar .result').on('mousedown', function (e) {
        resultTaped = true;
    });

    $('#side-bar .result').on('mouseup', function (e) {
        $('#search').blur();
    });
}


})();
