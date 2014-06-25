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
    if (!window.maps)  // Safety check (landing detail mobile)
        return;

    for (var i=0; i<window.maps.length; i++) {
        window.maps[i].invalidateSize();
    }
}


function init_ui() {
    $(document).pjax('a.pjax', '#pjax-content');

    FastClick.attach(document.body);

    $('body').on('click', 'a.utils', function (e){
        e.preventDefault();
    });

    $(window).trigger('view:ui');

    $(window).smartresize(invalidate_maps);
}

function page_load() {
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

    init_share();




    /* We want to initialize home map, when we land on home page
     * or when we visit home page through pjax after landing on other page...
     */
    var mainmapContainer = L.DomUtil.get('mainmap');
    if (mainmapContainer && typeof(loadmapmainmap) == "function") {
        loadmapmainmap();
    }

    if ($("#mainmap-tag").length > 0) {
        $(window).trigger('view:home');

        if(MOBILE) {
            $(window).trigger('view:mobile');
            init_mobile_navigation();
        }
    }
    else {
        $(window).trigger('view:detail');
    }
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

function init_mobile_navigation() {
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
}
