var TrekLayer = L.ObjectsLayer.extend({

    initialize: function (geojson, options) {
        L.ObjectsLayer.prototype.initialize.call(this, geojson, options);
    },
});












var map,
    treksLayer = null;

function initMap() {

	
				var hull = new L.LatLng(44.0, 7.15);
	
				map = new L.Map('map',{
            	zoomControl: false,
				
				});
				var osmUrl = 'http://{s}.tiles.mapbox.com/v3/examples.map-4l7djmvo/{z}/{x}/{y}.jpg';
				var osmAttrib = 'Map data © openstreetmap contributors';
				var osm = new L.TileLayer(osmUrl, {
					minZoom : 8,
					maxZoom : 18,
					attribution : osmAttrib,
					
					
				});
				var mycontrol = new L.Control.Zoom({
					position: 'topright',
				});
				
				map.setView(hull, 10);
				map.invalidateSize();
				map.addLayer(osm);
				map.addControl(mycontrol);
				
				function onEachFeature(feature, layer) {
					console.log(feature.properties);
					var html = "<h3>"+feature.properties.Name+"</h3>";
					html += "<p>"+feature.properties.Description+"</p>";
					html += "<img src='assets/img/stat.png'>";
					html += "<div class='popupdetail' style='text-align:center'><a href='#'>+ plus de détails</a></div>"
					layer.on("mouseover", function (e)
					{
						console.log(e);
						L.popup()
						.setLatLng(e.latlng)
						.setContent(html)
						.openOn(map);
					});
				}
				
				treksLayer = new L.GeoJSON(null, {
				   onEachFeature: onEachFeature
				});
				
				treksLayer.on("click", function (e) {
				   window.location.href = 'fiche.html';
				});
			map.addLayer(treksLayer);
};