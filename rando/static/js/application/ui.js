function refresh_results(visible) {
    var visible = visible;
    for(var i=0; i<treks.features.length; i++) {
        var trek = treks.features[i],
            trekid = trek.properties.pk;
        if ($.inArray(trekid, visible) != -1) {
            $('#trek-'+trekid).show(200);
        }
        else {
            $('#trek-'+trekid).hide(200);
        }
    }
    if (visible.length > 0)
        $('#noresult').hide(200);
    else
        $('#noresult').show(200); 
    // Refresh label with number of results
    $('#tab-results span.badge').html(visible.length);
}

function refresh_backpack() {
    for(var i=0; i<treks.features.length; i++) {
        var trek = treks.features[i],
            trekid = trek.properties.pk;
        if (window.backPack.contains(trekid)) {
            $('#backpack-trek-'+trekid).show(200);
            $('#trek-' + trekid + ' .btn.add-sac').addClass('active');
            $(".detail-content .btn[data-pk='"+ trekid + "']").addClass('active');
        }
        else {
            $('#backpack-trek-'+trekid).hide(200);
            $('#trek-' + trekid + ' .btn.add-sac').removeClass('active');
            $(".detail-content .btn[data-pk='"+ trekid + "']").removeClass('active');
        }
    }
    if (window.backPack.length() > 0)
        $('#backpackempty').hide(200);
    else
        $('#backpackempty').show(200);
    $('#tab-backpack span.badge').html(window.backPack.length());
}

function init_ui() {
    $('#content').pjax('a.pjax');

    window.backPack = new BackPack();
    $('body').on("backpack-change", refresh_backpack);

    $(window).on('resize', function() {
        layout();
    });
}

function page_load() {
    layout();

    // Refresh tab results
    window.trekFilter.load();
    refresh_backpack();
}

function layout() {
    if ($("#mainmap-tag").length > 0) {
        view_home ();
    }
    else {
        view_detail();
    }
    invalidate_maps();
}

function invalidate_maps() {
    if (window.maps) {
        $.each(window.maps, function (i, map) {
            map.invalidateSize();
        });
    }
}

function view_home () {
    toggle_filters();
    sliders();

    window.trekFilter = new TrekFilter();
    $(window.trekFilter).on("filterchange", function(e, visible) {
        refresh_results(visible);
    });
    $('#clear-filters').off('click').on('click', function () {
        window.trekFilter.clear();
    });


    $("#mainmap").show();  // We are on home with map

    $('#result-backpack-tabs .nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        $(this).parents('ul.nav-tabs').find('span.badge-warning').removeClass('badge-warning');
        $(this).find('span.badge').addClass('badge-warning');
    });

    // Add trek to backpack
    $('.add-sac').on('click', function (e) {
        var trekid = $(this).data('pk')
          , trekname = $(this).data('name');
        if (window.backPack.contains(trekid)) {
            window.backPack.remove(trekid);
            // Track event
            _gaq.push(['_trackEvent', 'Backpack', 'Remove', trekname]);
        }
        else {
            window.backPack.save(trekid);
            _gaq.push(['_trackEvent', 'Backpack', 'Add', trekname]);
        }
    });

    toggle_sidebar();

    // Zoom trek button
    $('.search-rando').on('click', function (e) {
      var trekOnMap = window.treksLayer.getLayer($(this).data('pk'));
      if (trekOnMap) {
        window.maps[0].fitBounds(fakeBounds(trekOnMap.getBounds()));
        // Track event
        _gaq.push(['_trackEvent', 'Results', 'Zoom', trekOnMap.properties.name]);
      }
    });

    $('#side-bar .result').on('dblclick', function (e) {
        $('#trek-'+ $(this).data('id') +'.result a.pjax').click();
        // Track event
        _gaq.push(['_trackEvent', 'Results', 'Doubleclick', $(this).data('name')]);
    });

    // Highlight map on hover in sidebar results
    $('#side-bar .result').hover(function () {
        window.treksLayer && window.treksLayer.highlight($(this).data('id'), true);
      },
      function () {
        window.treksLayer && window.treksLayer.highlight($(this).data('id'), false);
      }
    );
    // Click on side-bar
    $('#side-bar .result').on('click', function (e) {
        var trekOnMap = window.treksLayer.getLayer($(this).data('id'));
        if (trekOnMap) {
            // If multi - take first one
            if (trekOnMap instanceof L.MultiPolyline) {
                for (i in trekOnMap._layers) {
                    trekOnMap = trekOnMap._layers[i];
                    break;
                }
            }
            var coords = trekOnMap.getLatLngs(),
                middlepoint = coords[Math.round(coords.length/2)];
            trekOnMap.fire('click', {
              latlng: middlepoint,
            });
            // Track event
            _gaq.push(['_trackEvent', 'Results', 'Click', trekOnMap.properties && trekOnMap.properties.name]);
        }
        else {
          console.warn("Trek not on map: " + $(this).data('id'));
        }
    });
}

function view_detail() {
    $("#mainmap").hide();  // We are elsewhere

    $('#pois-accordion .accordion-toggle').click(function (e) {
        if ($(this).hasClass('open')) {
          $(this).removeClass('open');
          $('#pois-accordion').trigger('close', [this]);
        }
        else {
          $(this).addClass('open');
          $('#pois-accordion').trigger('open', [this])
        }
    });
}

function toggle_sidebar() {
    $('#toggle-side-bar').off('click');
    $('#toggle-side-bar').click(function() {
        if (!$(this).hasClass('closed')) {
            var width_sidebar = $('.side-bar').width() - $(this).width();
            $('.side-bar').animate({left : -width_sidebar+'px'}, 500);
        }
        else {
            $('.side-bar').animate({left:'0'}, 200);
        }
        $(this).toggleClass('closed');
    });
}

function toggle_filters() {
    var searchdefaultheight = $("#search-bar").height();
    $('#hide-filters').click(function() {
        $("#hide-filters").hide();
        $("#show-filters").show();
        $("#advanced-filters").hide();
        //$("#search-bar").height(searchdefaultheight);
        layout();
    });

    $('#show-filters').click(function() {
        $("#hide-filters").show();
        $("#show-filters").hide();
        $("#advanced-filters").show();
        //$("#search-bar").height(searchdefaultheight+40);
        layout();
    });
}



function  sliders() {
    var saveSlider = function (event, ui) {
        window.trekFilter.sliderChanged(ui.values[0],
                                        ui.values[1],
                                        $(this).data("filter"),
                                        $(this));
    };

    $( "#stage" ).slider({
        range: true,
        step: 1, 
        min: 1,
        max: 3,
        values: [ 1, 3 ],
        slide: saveSlider,
    });

    $( "#time" ).slider({
        range: true,
        step: 1, 
        min: 0,
        max: 4,
        values: [ 0, 4 ],
        slide: saveSlider,
    });

    $( "#den" ).slider({
        range: true,
        step: 1, 
        min: 0,
        max: 3,
        values: [ 0, 3 ],
        slide: saveSlider,
    });
};
