/**
 *
 * Note: this code was imported from plain old jQuery, and moved into
 * Backbone views.
 * Obviously, it was not completely rewritten and does not respect Backbone
 * conventions or good practices.
 *
 */
Rando.BaseView = Backbone.View.extend({

    initialize: function () {
        //
        // When application starts (only once)
        //
        FastClick.attach(document.body);

        Rando.MOBILE = false;
        function refreshMobile() {
            Rando.MOBILE = !!Modernizr.mq('only all and (max-width: 767px)');
        }
        refreshMobile();
        $(window).smartresize(refreshMobile);
        $(window).smartresize(Rando.utils.invalidateMaps);

        $(document).pjax('a.pjax', '#pjax-content');
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

        (new Rando.ShareWidget()).render();

        return this;

    },
});


Rando.ShareWidget = Backbone.View.extend({
    render: function () {
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
});


Rando.HomeView = Rando.BaseView.extend({});


Rando.DetailView = Rando.BaseView.extend({});
