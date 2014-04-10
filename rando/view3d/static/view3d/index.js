window.onload = function onload() {
    RANDO.SETTINGS.DEM_URL      = $('body').data('dem-url');
    RANDO.SETTINGS.PROFILE_URL  = $('body').data('profile-url');
    RANDO.SETTINGS.TEXTURE_URL  = null;  // no texture yet

    RANDO.SETTINGS.TREK_COLOR = new BABYLON.Color3(0.9,0.5,0);  // orange
    RANDO.SETTINGS.TREK_WIDTH = 9;

    if (BABYLON.Engine.isSupported()) {
        $('.not-supported').remove();

        var canvas = document.getElementById("canvas_renderer");
        RANDO.Builds.launch(window, jQuery, canvas);
    }

};
