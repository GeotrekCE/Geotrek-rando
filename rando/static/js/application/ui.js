//--------- Fix side-bar height -------------//

function layout() {
    var tabheight = sidebar_h()+"px";
    $('.tab-pane, #container-content, .side-bar').css("height", tabheight);

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
        h -= 40;  // why ??
    }
    return h;
}


function filtre()
{
	
	$('.show_hide_filter').click(function() {
					$('.slidingDiv1-bar').animate({
						width : 'toggle'
					});
					$(".slidingDiv1").show();
					$(".header-2").css("height", "161px");
					$(".filter").css("height","94%");
					$(".show_hide_filter").hide();
					$(".hide_show_filter").show();
					$(".side-bar").css("top","242px");
				    layout();
					});
	$('.hide_show_filter').click(function() {
					$('.slidingDiv1-bar').animate({
						width : 'toggle'
					});
					$(".slidingDiv1").hide();
					$(".header-2").css("height", "80px");
					$(".filter").css("height","88%");
					$(".show_hide_filter").show();
					$(".hide_show_filter").hide();
					$(".side-bar").css("top","161px");
					layout();	
				});
} 
function fix_content()
{
	$('.show_hide').click(function() {
					var width_sidebar = $('.side-bar').width();
					width_sidebar = 0 - width_sidebar;
					$('.side-bar').animate({
						left : width_sidebar+'px'
					},500);
					$(".slidingDiv").show(500);
					map.invalidateSize();

				});
	$('.slidingDiv').click(function() {
					$('.side-bar').animate({
						left:'0'
					});
					$(".side-bar").show();
					$(".slidingDiv").hide(100);
					$('.side-bar').css('width','30%');
					$('.side-bar').css('min-width','408px');
					$("#tab-results").addClass('active');
					$("#tab-backpack").removeClass('active');
					$("#tab1").css('display','block');
					$("#tab2").css('display','none');
					
					
					

				});
}

















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

function  slider_feature()
{
	$( "#stage" ).slider({
              range: true,
              step: 1, 
              min: 1,
              max: 3,
              values: [ 1, 3 ],
              slide: function( event, ui ) {
				  var store = new storage();
					  store.SaveSlider(ui.values[0],ui.values[1],$(this).data("filter"));
              }
          });
		   
      
      
     
       $( "#time" ).slider({
              range: true,
              step: 5, 
              min: 0,
              max: 20,
              values: [ 0, 10 ],
              slide: function( event, ui ) {
				  var store = new storage();
					  store.SaveSlider(ui.values[0],ui.values[1],$(this).data("filter"));
              }
          });
          
       $( "#den" ).slider({
              range: true,
              step: 1.35, 
              min: 0,
              max: 4,
              values: [ 0, 1 ],
              slide: function( event, ui ) {
				  var store = new storage();
					  store.SaveSlider(ui.values[0],ui.values[1],$(this).data("filter"));
              }
          });
          
};
