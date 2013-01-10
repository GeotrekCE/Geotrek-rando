//--------- Fix side-bar height -------------//

		
function sidebar_h()
{
	var sidebar_h = 0;
	var others_h = 0;
	sidebar_h = $(window).height() -$('.navbar-fixed-top').height() - 76;
	$('#container-content').css("height",sidebar_h+"px");
	$('.side-bar').css("height",sidebar_h+"px");
	if ($.browser.webkit) {
   		others_h = $('.side-bar').height() - $('.nav-tabs').height()-60;
  	}else
	{
		others_h = $('.side-bar').height() - $('.nav-tabs').height()-20;
	}
	return (others_h);
}
//----------Fix tabbable height ------------//
function tabbable()
{
	$('#tab1').css("height",sidebar_h()+"px");
	$('#tab2').css("height",sidebar_h()+"px");
	map.invalidateSize();
	
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
				    tabbable();
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
					tabbable();	
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

function tabbar()
{
	$('#tab-backpack').click(function() {
		$('#tab1').css('display','none');
		$('#tab2').css('display','block');
		$('#tab-backpack').addClass('active');
		$('#tab-results').removeClass('active');
		$('#tab2').jScrollPane();
	});
	$('#tab-results').click(function() {
		$('#tab2').css('display','none');
		$('#tab1').css('display','block');
		$('#tab-results').addClass('active');
		$('#tab-backpack').removeClass('active');
		$('#tab1').jScrollPane();
	});
}
function hover()
{
$(".side-bar .result").hover(
  function () {
    $(this).css('background','#e7e9a0');
  }, 
  function () {
    $(this).css('background','none');
  
});
}
function hover_route()
{
$(".leaflet-clickable").hover(
  function () {
    $(this).attr('stroke','#cedc00');
  }, 
  function () {
    $(this).attr('stroke','#0033ff');
  
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
