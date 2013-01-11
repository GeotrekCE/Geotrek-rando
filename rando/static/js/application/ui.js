function page_load() {
    $('#result-backpack-content .tab-pane').jScrollPane();

    $('#result-backpack-tabs .nav-tabs a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    if ($("#mainmap-tag").length > 0) {
        console.log('Home map...');
        $("#mainmap").show();  // We are on home with map
    }
    else {
        console.log('Elsewhere...');
        $("#mainmap").hide();  // We are elsewhere
    }

    layout();
}


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

function layout() {
    var tabheight = sidebar_h()+"px";
    $('#container-content, .side-bar').css('top', $('#top-panel').height()+'px');
    $('#container-content, .side-bar').css("height", tabheight);

    // Refresh map view
    if (window.maps) {
        $.each(window.maps, function (i, map) {
            map.invalidateSize();
        });
    }
};

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


















function musee_open_close()
{
	$("#musee").click(function() {
		if ($(this).attr('id') == 'musee')
		{
  		$(this).attr('id', 'musee-open');
		}else
		{
			$(this).attr('id', 'musee');
		}
});
}
function lac_open_close()
{
	$("#lac").click(function() {
		if ($(this).attr('id') == 'lac')
		{
  		$(this).attr('id', 'lac-open');
		}else
		{
			$(this).attr('id', 'lac');
		}
});
}
function panorama_open_close()
{
	$("#panorama").click(function() {
		if ($(this).attr('id') == 'panorama')
		{
  		$(this).attr('id', 'panorama-open');
		}else
		{
			$(this).attr('id', 'panorama');
		}
});
}
function refuge_open_close()
{
	$("#refuge").click(function() {
		if ($(this).attr('id') == 'refuge')
		{
  		$(this).attr('id', 'refuge-open');
		}else
		{
			$(this).attr('id', 'refuge');
		}
});
}
