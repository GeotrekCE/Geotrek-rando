/**
 *
 * Note: this code was imported from plain old jQuery, and moved into
 * Backbone views.
 * Obviously, it was not completely rewritten and does not respect Backbone
 * conventions or good practices.
 *
 */
Rando.views = {};

Rando.views.BaseView = Backbone.View.extend({

    initialize: function (options) {
        Backbone.View.prototype.initialize.apply(this, arguments);

        this.app = options.app;

        this._shareWidget = new Rando.views.ShareWidget();
    },

    setupMap: function (map) {
        var control = new L.Control.SwitchBackgroundLayers();
        control.addTo(map);
    },

    render: function () {
        //
        // On PJAX load (each change of page)
        //

        // Buttons
        $('body').on('click', 'a.utils', function (e){
            e.preventDefault();
        });

        // Flex divs :)
        $('.row-fluid').each(function () {
            var $flex = $(this).find('> .flex');
            if ($flex.length === 0) return;
            var span = Math.round(12 / $flex.length);
            $flex.each(function (i, v) {
                $(v).addClass('span'+span);
            });
        });

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

        // Lang button
        $('#lang-switch a.utils').on('click', function () {
            $(this).siblings('ul').toggle();
        });

        // Lang button
        $('#lang-switch a.utils').on('click', function () {
            $(this).siblings('ul').toggle();
        });

        /* We want to initialize home map, when we land on home page
         * or when we visit home page through pjax after landing on other page...
         */
        var mainmapContainer = L.DomUtil.get('mainmap');
        if (mainmapContainer && typeof(loadmapmainmap) == "function") {
            loadmapmainmap();
        }

        this._shareWidget.render();

        return this;
    },

    remove: function () {
        Backbone.View.prototype.remove.call(this);
        this._shareWidget.remove();
        return this;
    }
});


Rando.views.ShareWidget = Backbone.View.extend({
    render: function () {
        var $share = $('#global-share'),
            $panel = $('#social-panel'),
            markup = $panel.html(),
            shown = false;

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
    },

    remove: function () {
        Backbone.View.prototype.remove.call(this);
        // Close share panel (if open)
        $("#global-share.active").click();
        return this;
    }
});


Rando.views.HomeView = Rando.views.BaseView.extend({

    setupMap: function (map) {
        Rando.views.BaseView.prototype.setupMap.call(this, map);
        mainmapSetup(map, this.app);
    },

    render: function () {
        Rando.views.BaseView.prototype.render.call(this);

        this._initFilters();

        $("#mainmap").show();  // We are on home with map
        Rando.utils.invalidateMaps();

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

        return this;
    },


    _initFilters: function () {
        $('#clear-filters').off('click').on('click', function () {
            $(window).trigger("filters:clear");
        });

        $(window).on("filters:changed", function(e, visible) {
            this._refreshResults(visible);
        }.bind(this));
    },


    _refreshResults: function(matching) {
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
});


Rando.views.HomeViewMobile = Rando.views.BaseView.extend({

    setupMap: function (map) {
        Rando.views.BaseView.prototype.setupMap.call(this, map);
        mainmapSetup(map, this.app);
    },

    render: function () {
        Rando.views.BaseView.prototype.render.call(this);

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

        $('#navigationbar a.pjax').on('click', function (e) {
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
        return this;
    }
});


Rando.views.DetailView = Rando.views.BaseView.extend({

    setupMap: function (map) {
        Rando.views.BaseView.prototype.setupMap.call(this, map);
        detailmapSetup(map, this.app);
    },

    render: function () {
        Rando.views.BaseView.prototype.render.call(this);

        $("#mainmap").hide();  // We are elsewhere

        if (!Rando.MOBILE) {
            if (typeof(loadmapdetailmap) == "function") {
                // Detail map is not present on flatpages
                loadmapdetailmap();
            }
        }
        else {
            $('#detailmap #staticmap').removeClass('hidden');
            $('#detailmap .helpclic').hide();
        }

        $('#tab-results span.badge').html(this.app.trekCollection.length);

        // Cycle Trek carousel automatically on start
        if (!Rando.MOBILE) {
            $('#trek-carousel .carousel').carousel('cycle');
        }

        //Load altimetric graph
        if ($('#altitudegraph').length > 0) {
            var jsonurl = $('#altitudegraph').data('url');
            this._altimetricInit(jsonurl);
        }

        // Tooltips
        $('#usages div, #themes div').tooltip();
        $('#object-identity .info').tooltip();
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

        return this;
    },


    _altimetricInit: function(jsonurl) {
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

});
