function init_ui() {
    $('#content').pjax('a.pjax');

    toggle_sidebar();
    toggle_filters();
    sliders();

    window.store = new storage();
    window.store.ChangeStateTheme();
    window.store.loadSlider();

    $(store).on("filterchange",function(e) {
        $.each(window.treks, function (i, trek) {
          var trekid = trek.properties.pk;
          if (window.store.match(trek)) {
            $('#trek-'+trekid).show();
          }
          else {
            $('#trek-'+trekid).hide();
          }
        });
    });

    $(window).on('resize', function() {
      layout();
    });
}

function page_load() {
    $('#result-backpack-content .tab-pane').jScrollPane();

    $('#result-backpack-tabs .nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    layout();
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
    $('#container-content, #side-bar').css('top', $('#top-panel').height()+'px');
    $('#container-content, #side-bar').css("height", sidebar_h()+"px");
    $("#mainmap").show();  // We are on home with map
}

function view_detail() {
    $("#mainmap").hide();  // We are elsewhere
    $('body').css('overflow', 'default');
    $('.footer').css('position', 'relative');
    $('.detail-content').css('margin-top', $('#top-panel').height()+'px');
    $('#container-content').css('position', 'static');
    $('#container-content').attr('style', '');

    $('.accordion-toggle').click(function (e) {
        if ($(this).hasClass('open'))
          $(this).removeClass('open')
        else
          $(this).addClass('open')
    });
}

function sidebar_h() {
    var h = $(window).height() - $('#top-panel').height()
                               - $('#bottom-panel').height();
    if ($.browser.webkit) {
        h -= 10;  // why ??
    }
    return h;
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
        $("show-side-bar").hide(100);
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
        window.store.SaveSlider(ui.values[0],
                                ui.values[1],
                                $(this).data("filter"));
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
        step: 5, 
        min: 0,
        max: 20,
        values: [ 0, 10 ],
        slide: saveSlider,
    });

    $( "#den" ).slider({
        range: true,
        step: 1.35, 
        min: 0,
        max: 4,
        values: [ 1, 1 ],
        slide: saveSlider,
    });
};
