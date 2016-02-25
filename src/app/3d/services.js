'use strict';

function webglService () {

    this.isEnabled = function() {
        // Create canvas element. The canvas is not added to the
        // document itself, so it is never displayed in the
        // browser window.
        var canvas = document.createElement("canvas");
        // Get WebGLRenderingContext from canvas element.
        var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        // Report the result.
        if (gl && gl instanceof WebGLRenderingContext) {
            return true;
        }

        return false;
    };
}

function loadRando3D ($q) {
    var deferred = $q.defer();

    var script = document.createElement('script');
    script.src = 'rando-3D.js';
    document.getElementsByTagName('head')[0].appendChild(script);
    script.onload = function() {
        deferred.resolve();
    };
    return deferred.promise;
}

module.exports = {
    webglService: webglService,
    loadRando3D: loadRando3D
};
