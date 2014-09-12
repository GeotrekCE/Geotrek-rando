(function (window) {
"use strict";


var App = Backbone.Router.extend({

    initialize: function () {

        window.trekFilter = new TrekFilter();

        this.homeView = new Rando.HomeView();
        this.detailView = new Rando.DetailView();

        $(window).trigger('view:ui');

        // Bind PJAX events to Backbone router
        $(document).bind("pjax:success", function refreshRouter(e) {
            var url = window.location.pathname;
            this.navigate(url, {trigger: true});
        }.bind(this));

        $(document).on('pjax:start', function (e) {
            $(window).trigger('view:leave');
        });

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

        this.homeView.render();

        $(window).trigger(Rando.MOBILE ? 'view:mobile' : 'view:home');
    },

    detail: function (lang, slug) {
        console.log('detail', lang, slug);

        this.detailView.render();

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
