window.ALTIMETRIC_PROFILE_OPTIONS = L.Util.extend({
    fillColor: '#FFD1A1',
    lineColor: '#F77E00',
    lineWidth: 3
}, window.ALTIMETRIC_PROFILE_OPTIONS || {});

window.TREK_LAYER_OPTIONS = L.Util.extend({
    style: {'color': '#F89406', 'weight': 5, 'opacity': 0.8},
    hoverstyle: {'color': '#F89406', 'weight': 5, 'opacity': 1.0},
    outlinestyle: {'color': 'yellow', 'weight': 10, 'opacity': 0.8},
    arrowstyle: {'fill': '#E97000', 'font-weight': 'bold'},
    positionstyle: {'fillOpacity': 1.0, 'opacity': 1.0, 'fillColor': 'white', 'color': 'black', 'width': 3},
    iconifyZoom: 12,
    clusterOptions: {
        showCoverageOnHover: false,
        maxClusterRadius: 36,
    }
}, window.TREK_LAYER_OPTIONS || {});

window.MOBILE = false;

// Default Google Analytics in case Do-Not-Track is set
window._gaq = window._gaq || [];

$(document).ready(function (e) {
    window.MOBILE = !!Modernizr.mq('only all and (max-width: 767px)');
    window.trekFilter = new TrekFilter();
    window.backPack = new BackPack();

    init_ui();
    page_load();
});

$(document).on('pjax:start', function (e) {
    $(window).trigger('view:leave');
});

$(document).on('pjax:end', function (e) {
    page_load();
});

$(window).smartresize(function() {
    // Check if youre on mobile or not
    if(Modernizr.mq('only all and (max-width: 767px)')) {
        MOBILE = true;
    } else {
        MOBILE = false;
    }
});