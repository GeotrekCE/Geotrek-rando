Rando.utils = {

    invalidateMaps: function () {
        if (!window.maps)  // Safety check (landing detail mobile)
            return;

        for (var i=0; i<window.maps.length; i++) {
            window.maps[i].invalidateSize();
        }
    },

    distanceMeters: function (p1, p2) {
        var R = 6371000,
            dLat = toRad(p2.lat - p1.lat),
            dLon = toRad(p2.lng - p1.lng);
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(toRad(p2.lat)) * Math.cos(toRad(p2.lat)) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a) , Math.sqrt(1-a));
        var d = R * c;
        function toRad(n) { return n * Math.PI / 180; }
        return d;
    },

    latLngAtDistance: function (polyline, distance) {
        // Initialization of variables
        var points = polyline.getLatLngs(),
            distance_cum = 0.0;
        //iterate line points
        for (var i=1; i<points.length; i++) {
          var p1 = points[i-1],
              p2 = points[i];
          distance_cum = distance_cum + Rando.utils.distanceMeters(p1, p2);
          if (distance_cum >= distance) {
              return L.latLng(p2.lat, p2.lng);
          }
        }
        return null;
    }
};


Modernizr.addTest('fullscreen', function(){
     var ancelFullScreen = 'ancelFullScreen'; //make string minifiable

     //FF9 pre-check
     if(document.mozCancelFullScreen && !document.mozFullScreenEnabled) return false;

     var limit = Modernizr._domPrefixes.length;
     for(var i = 0; i < limit; ++i) {
        if( document[[Modernizr._domPrefixes[i].toLowerCase(),'C',ancelFullScreen].join('')])
            return true;
     }
     return !!document[['c',ancelFullScreen].join('')] || false;
});
