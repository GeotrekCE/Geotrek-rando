var ALTIMETRIC_PROFILE_OPTIONS = L.Util.extend({
    fillColor: '#FFD1A1',
    lineColor: '#F77E00',
    lineWidth: 3,
}, ALTIMETRIC_PROFILE_OPTIONS || {});

window.MOBILE = false;
window.ALTIMETRIC_PROFILE_OPTIONS = {};

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
