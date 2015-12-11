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
    }
}

module.exports = {
  webglService: webglService
};
