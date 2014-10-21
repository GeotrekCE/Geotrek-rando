(function (window) {
"use strict";


var App = Backbone.Router.extend({

    initialize: function () {

        this._currentView = null;
        this.homeView = new Rando.views.HomeView({ app: this });
        this.homeViewMobile = new Rando.views.HomeViewMobile({ app: this });
        this.detailView = new Rando.views.DetailView({ app: this });

        $(window).trigger('view:ui');

        this._initializeCollections();
        this._initializePjax();
        this._initializeWindowResize();

        // Bind django-leaflet map initialization callback
        $(window).on('map:init', function (jqEvent) {
            this._currentView.setupMap(jqEvent.originalEvent.detail.map);
        }.bind(this));

        // Start watching URL
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

        this._currentView = Rando.MOBILE ? this.homeViewMobile : this.homeView;
        this._currentView.render();

        $(window).trigger('view:home');
    },

    detail: function (lang, slug) {
        console.log('detail', lang, slug);

        this._currentView = this.detailView;
        this._currentView.render();

        $(window).trigger('view:detail');
    },

    _initializeCollections: function () {
        this.trekCollection = new Rando.models.TrekCollection();

        var trekFilter = new TrekFilter();
        trekFilter.setup();
        this.trekCollection.on('sync', function () {
            trekFilter.load(this.trekCollection.models);
        }, this);

        this.trekLayer = new TrekLayer();
        this.trekCollection.on('sync', function () {
            this.trekLayer.addData(this.trekCollection.geojson);
            this.trekLayer.fire('data:loaded');
        }, this);

        // Fetch collections
        this.trekCollection.fetch();
    },

    _initializePjax: function () {
        // Bind PJAX events to Backbone router
        $(document).bind("pjax:success", function refreshRouter(e) {
            var url = window.location.pathname;
            this.navigate(url, {trigger: true});
        }.bind(this));

        $(document).on('pjax:start', function (e) {
            $(window).trigger('view:leave');
            this._currentView.remove();
        }.bind(this));

        $(document).pjax('a.pjax', '#pjax-content');
    },

    _initializeWindowResize: function () {
        Rando.MOBILE = false;
        function refreshMobile() {
            Rando.MOBILE = !!Modernizr.mq('only all and (max-width: 767px)');
        }
        refreshMobile();
        $(window).smartresize(refreshMobile);
        $(window).smartresize(Rando.utils.invalidateMaps);
    }

});


// Default Google Analytics in case Do-Not-Track is set
window._gaq = window._gaq || [];

//
// Start !
//
(new App());

})(window);
