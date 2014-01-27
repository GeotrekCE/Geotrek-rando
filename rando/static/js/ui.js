Modernizr.addTest('fullscreen', function(){
     var ancelFullScreen = 'ancelFullScreen'; //make string minifiable

     //FF9 pre-check
     if(document.mozCancelFullScreen && !document.mozFullScreenEnabled) return false;

     var limit = Modernizr._domPrefixes.length;
     for(var i = 0; i < limit; ++i) {
        if( document[[Modernizr._domPrefixes[i].toLowerCase(),'C',ancelFullScreen].join('')])
            return true;
     }
     return !!document[['c',ancelFullScreen].join('')] || false;
});


function invalidate_maps() {
    for (var i=0; i<window.maps.length; i++) {
        window.maps[i].invalidateSize();
    }
}


function init_ui() {
    $(document).pjax('a.pjax', '#content');

    FastClick.attach(document.body);

    $('body').on('click', 'a.utils', function (e){
        e.preventDefault();
    });

    $(window).on("filters:changed", function(e, visible) {
        refresh_results(visible);
    });

    $(window).smartresize(invalidate_maps);
}

function page_load() {
    /* We want to initialize home map, when we land on home page
     * or when we visit home page through pjax after landing on other page...
     */
    var mainmapContainer = L.DomUtil.get('mainmap');
    if (mainmapContainer && typeof(loadmapmainmap) == "function") {
        loadmapmainmap();
    }

    // Reattach elements coming from PJAX
    $('.reattach').each(function () {
        var $elem = $(this),
            destination = $elem.data('destination'),
            id = $elem.attr('id');
        if (id === undefined) {
            console.warn('No id attribute in div.reattach, expect duplicates upon navigation.');
        }
        $(destination).find('#'+id).remove();
        $elem.removeClass('reattach').detach().appendTo(destination);
    });

    if ($("#mainmap-tag").length > 0) {
        view_home();
        $(window).trigger('view:home');
    }
    else {
        view_detail();
        $(window).trigger('view:detail');
    }

    // Flex divs :)
    $('.row-fluid').each(function () {
        var $flex = $(this).find('.flex');
        if ($flex.length === 0) return;
        var span = Math.round(12 / $flex.length);
        $flex.each(function (i, v) {
            $(v).addClass('span'+span);
        });
    });

    init_share();

    initBackpack();

    // Lang button
    $('#lang-switch a.utils').on('click', function () {
        $(this).siblings('ul').toggle();
    });
}

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
        window.trekFilter.clear();
    });

    $("#mainmap").show();  // We are on home with map
    invalidate_maps();

    // Results tabs panels behaviour
    $('#result-backpack-tabs .nav-tabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
        $(this).parents('ul.nav-tabs').find('span.badge-warning').removeClass('badge-warning');
        $(this).find('span.badge').addClass('badge-warning');
    });
    // Show active tab
    if (/results|backpack/.test(window.location.hash)) {
        $('#tab-' + window.location.hash.slice(1) + ' a').click();
    }
    // Focus search field
    if (/search/.test(window.location.hash)) {
        $('input#search').focus();
    }

    $('#toggle-side-bar').off('click').on('click', function () {
        if (!$(this).hasClass('closed')) {
            var width_sidebar = $('.side-bar').width() - $(this).width();
            $('#side-bar').addClass('closed').animate({left : -width_sidebar+'px'}, 700, 'easeInOutExpo');
        }
        else {
            $('#side-bar').removeClass('closed').animate({left:'0'}, 700, 'easeInOutExpo');
        }
        $(this).toggleClass('closed');
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

    if(MOBILE) {
        init_mobile();
    }
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


function initBackpack() {
    $(window).on("backpack:change", refresh_backpack);

    // Refresh tab results
    refresh_backpack();

    var $detailBackpack = $(".detail-content .btn.backpack"),
        trekId = $detailBackpack.data('id');
    if (window.backPack.contains(trekId))
        $detailBackpack.addClass('active');
    else
        $detailBackpack.removeClass('active');

    // Add trek to backpack
    $('.btn.backpack').on('click', function (e) {
        var trekid = $(this).data('id'),
            trekname = $(this).data('name');
        if (window.backPack.contains(trekid)) {
            window.backPack.remove(trekid);
            $(this).removeClass('active');
            // Track event
            _gaq.push(['_trackEvent', 'Backpack', 'Remove', trekname]);
        }
        else {
            window.backPack.save(trekid);
            $(this).addClass('active');
            _gaq.push(['_trackEvent', 'Backpack', 'Add', trekname]);
        }
    });
}


function refresh_backpack() {
    $('#backpack .result').each(function () {
        var $trek = $(this),
            trekId = $trek.data('id');
        if (window.backPack.contains(trekId)) {
            $trek.show(200);
        }
        else {
            $trek.hide(200);
        }
    });

    $('#results .result, #backpack .result').each(function () {
        var $trek = $(this),
            trekId = $trek.data('id');
        if (window.backPack.contains(trekId)) {
            $trek.find('.btn.backpack').addClass('active')
                                       .attr('title', gettext('Remove from favorites'))
                                       .removeClass('icon-backpack-add')
                                       .addClass('icon-backpack-remove');
        }
        else {
            $trek.find('.btn.backpack').removeClass('active')
                                       .attr('title', gettext('Add to favorites'))
                                       .removeClass('icon-backpack-remove')
                                       .addClass('icon-backpack-add');
        }
    });

    if (window.backPack.length() > 0)
        $('#backpackempty').hide(200);
    else
        $('#backpackempty').show(200);

    // Refresh label with number of items
    $('#tab-backpack span.badge').html(window.backPack.length());
}

function view_detail() {
    $("#mainmap").hide();  // We are elsewhere

    if (!MOBILE) {
        loadmapdetailmap();
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
    $('a.print.disabled').tooltip({placement: 'left'});
    $('#pois-accordion .pictogram').tooltip();
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

function init_share() {
    var $share = $('#global-share'),
        $panel = $('#social-panel'),
        markup = $panel.html(),
        shown = false;

    $(window).on('view:leave', function (e) {
        // Close share panel (if open)
        $("#global-share.active").click();
    });

    var previous = $share.data('popover');
    if (previous) {
        $share.removeData('popover');
    }
    $share.popover({
        animation: false,
        html: true,
        placement: 'left',
        trigger: 'manual',
        title: '',
        content: markup
    });

    $share.off('click').on('click', function () {
        var $this = $(this);
        $this.toggleClass('active');
        var popover = $this.data('popover');

        // if(init){
        //     popover.toggle();
        //     return;
        // }

        // init = true;

        if (shown) {
            popover.hide();
            shown = false;
            return;
        }

        shown = true;
        popover.show();
        // Prevent to go outside screen
        if (popover.tip().position().top < 0) {
            popover.tip().css('top', '0px');
        }
        var lang = $("meta[name='language']").attr('content');
        lang = lang + '_' + lang.toUpperCase();
        Socialite.setup({
            facebook: {lang: lang},
            twitter: {lang: lang},
            googleplus: {lang: lang}
        });
        Socialite.load(popover.tip());
    });
}

function init_mobile() {
    var $menuButton = $('#toggle-header-mobile'),
        $menu       = $('header');

    // Pages menu toggle
    $menuButton.on('click', function (e) {
        // if menu open
        if($menu.hasClass('open')) {
            $menu.removeClass('open');
            $(this).removeClass('active');
            $(document).off('click.menu');
        } else {
            $menu.addClass('open');
            $(this).addClass('active');

            // any touch outside, close the menu
            $(document).on('click.menu', function (e) {
                if ($menu.has(e.target).length === 0 && e.target != $menu[0] && $menuButton.has(e.target).length === 0 && e.target != $menuButton[0]){
                    $menu.removeClass('open');
                    $menuButton.removeClass('active');
                    $(document).off('click.menu');
                }
            });
        }
    });

    $('#flatpages a.pjax').on('click', function (e) {
        $menu.removeClass('open');
        $menuButton.removeClass('active');
    });

    // Remove desktop specific events
    $('#side-bar .result').off('dblclick mouseenter mouseleave');

    // Show search tab
    $('#search').on('focus', function (e) {

        // Reset button when searching (trigger closing of mobile keyboard)
        $('#text-search .navbar-search div').removeClass('icon-search').addClass('icon-fontawesome-webfont-1').one('click', function (e) {
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

    // Show backpack tab
    $('#tab-backpack a').off('click').on('click', function (e) {
        e.preventDefault();

        if ($(this).parent().hasClass('active')) {
            $(document).off('click.backpack');
        } else {
            $(document).on('click.backpack', function (e) {
                if ($('#tab-backpack').has(e.target).length === 0 && e.target != $('#tab-backpack')[0]){
                    $('#backpack').hide();
                    $('#tab-backpack').removeClass('active');
                    $(document).off('click.backpack');
                }
            });
        }

        $(this).parent().toggleClass('active');
        $('#backpack').toggle();
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
