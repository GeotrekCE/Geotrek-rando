(function (window) {
"use strict";


var App = Backbone.Router.extend({

    initialize: function () {

        window.trekFilter = new TrekFilter();

        this._current = null;
        this.homeView = new Rando.HomeView();
        this.homeViewMobile = new Rando.HomeViewMobile();
        this.detailView = new Rando.DetailView();

        $(window).trigger('view:ui');

        // Bind PJAX events to Backbone router
        $(document).bind("pjax:success", function refreshRouter(e) {
            var url = window.location.pathname;
            this.navigate(url, {trigger: true});
        }.bind(this));

        $(document).on('pjax:start', function (e) {
            $(window).trigger('view:leave');
            this._current.remove();
        }.bind(this));


        FastClick.attach(document.body);

        Rando.MOBILE = false;
        function refreshMobile() {
            Rando.MOBILE = !!Modernizr.mq('only all and (max-width: 767px)');
        }
        refreshMobile();
        $(window).smartresize(refreshMobile);
        $(window).smartresize(Rando.utils.invalidateMaps);

        $(document).pjax('a.pjax', '#pjax-content');


        Backbone.history.start({
            pushState: true,
            root: "/"
        });
    },

    routes: {
        ':lang/': 'home',
        ':lang/*slug': 'detail',
    },

    home: function (lang) {
        console.log('home', lang);

        this._current = Rando.MOBILE ? this.homeViewMobile : this.homeView;
        this._current.render();

        $(window).trigger('view:home');
    },

    detail: function (lang, slug) {
        console.log('detail', lang, slug);

        this._current = this.detailView;
        this._current.render();

        $(window).trigger('view:detail');
    },
});


// Default Google Analytics in case Do-Not-Track is set
window._gaq = window._gaq || [];

//
// Start !
//
(new App());

})(window);
