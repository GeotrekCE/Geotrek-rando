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

    toggle_filters();
    sliders();

    window.trekFilter = new TrekFilter();
    window.backPack = new BackPack();

    $(window.trekFilter).on("filterchange", function(e, visible) {
        refresh_results(visible);
    });
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

    // Add trek to backpack
    $('.add-sac').on('click', function (e) {
        var trekid = $(this).data('pk');
        if (window.backPack.contains(trekid)) {
            window.backPack.remove(trekid);
        }
        else {
            window.backPack.save(trekid);
        }
    });
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
    $('body').css('overflow', 'hidden');
    $('.footer').css('position', 'absolute');
    $('#container-content').css('position', 'fixed');
    $('#container-content, #side-bar').css('top', toppanel_h()+'px');
    $('#container-content, #side-bar').css("height", sidebar_h()+"px");
    $('#show-side-bar').css("top", ($('#text-search').height()-sidebar_h())+"px");

    $("#mainmap").show();  // We are on home with map

    //$('#result-backpack-content .tab-pane').jScrollPane();

    $('#result-backpack-tabs .nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        $(this).parents('ul.nav-tabs').find('span.badge-warning').removeClass('badge-warning');
        $(this).find('span.badge').addClass('badge-warning');
    });

    toggle_sidebar();

    // Zoom trek button
    $('.search-rando').on('click', function (e) {
      var trekOnMap = window.treksLayer.getLayer($(this).data('pk'));
      if (trekOnMap) {
        window.maps[0].fitBounds(trekOnMap.getBounds());
      }
    });

    $('.side-bar .result').on('dblclick', function (e) {
        $('#trek-'+ $(this).data('id') +'.result a.pjax').click();
    });

    // Highlight map on hover in sidebar results
    $('.side-bar .result').hover(function () {
        window.treksLayer && window.treksLayer.highlight($(this).data('id'), true);
      },
      function () {
        window.treksLayer && window.treksLayer.highlight($(this).data('id'), false);
      }
    );
    // Click on side-bar
    $('.side-bar .result').on('click', function (e) {
        var trekOnMap = window.treksLayer.getLayer($(this).data('id'));
        if (trekOnMap) {
            var coords = trekOnMap.getLatLngs(),
                middlepoint = coords[Math.round(coords.length/2)];
            trekOnMap.fire('click', {
              latlng: middlepoint,
            });
        }
        else {
          console.warn("Trek not on map: " + $(this).data('id'));
        }
    });
}

function view_detail() {
    $("#mainmap").hide();  // We are elsewhere
    $('body').css('overflow', 'default');
    $('.footer').css('position', 'relative');
    $('.flatpage-content, .detail-content').css('margin-top', toppanel_h()+'px');
    $('.flatpage-content, .detail-content').css('min-height', sidebar_h()+"px");

    $('#container-content').css('position', 'static');
    $('#container-content').attr('style', '');
    $('#hide-side-bar').unbind('click');

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

function toppanel_h() {
    var h = $('#top-panel').height(),
        expanded = $('#advanced-filters').is(':visible');
    if (expanded) {
        h -= 10;  // why ??
    }
    return h;
}

function sidebar_h() {
    return $(window).height() - toppanel_h()
                              - $('#bottom-panel').height();
}

function toggle_sidebar() {
    $('#hide-side-bar').click(function() {
        var width_sidebar = $('.side-bar').width();
        $('.side-bar').animate({
            left : -width_sidebar+'px'
        }, 500);
        $("#show-side-bar").show(500);
    });

    $('#show-side-bar').click(function() {
        $('.side-bar').animate({
            left:'0'
        });
        $("#show-side-bar").hide(100);
        // Result tab as active
        $("#tab-results a").click();
    });
}

function toggle_filters() {
    var searchdefaultheight = $("#search-bar").height();
    $('#hide-filters').click(function() {
        $("#hide-filters").hide();
        $("#show-filters").show();
        $("#advanced-filters").hide();
        $("#search-bar").height(searchdefaultheight);
        layout();
    });

    $('#show-filters').click(function() {
        $("#hide-filters").show();
        $("#show-filters").hide();
        $("#advanced-filters").show();
        $("#search-bar").height(searchdefaultheight * 2);
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
