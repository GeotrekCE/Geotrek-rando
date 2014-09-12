Rando.utils = {

    invalidateMaps: function () {
        if (!window.maps)  // Safety check (landing detail mobile)
            return;

        for (var i=0; i<window.maps.length; i++) {
            window.maps[i].invalidateSize();
        }
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
