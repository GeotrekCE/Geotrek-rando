window.onload = function onload() {
    if (BABYLON.Engine.isSupported()) {
        $('.not-supported').remove();


        RANDO.SETTINGS.DEM_URL      = $('body').data('dem-url');
        RANDO.SETTINGS.PROFILE_URL  = $('body').data('profile-url');
        RANDO.SETTINGS.POI_URL      = $('body').data('poi-url');
        RANDO.SETTINGS.TILE_TEX_URL = $('body').data('tiles-url');
        RANDO.SETTINGS.SIDE_TEX_URL = $('body').data('static-url') + "img/side.jpg";
        RANDO.SETTINGS.FAKE_TEX_URL = $('body').data('static-url') + "img/white.png";
        RANDO.SETTINGS.PICTO_PREFIX = "";

        RANDO.SETTINGS.TREK_COLOR = new BABYLON.Color3(0.9,0.5,0);  // orange
        RANDO.SETTINGS.TREK_WIDTH = 12;
        RANDO.SETTINGS.CAM_SPEED_F  = 50;
        RANDO.SETTINGS.TILE_NUMBER_LIMIT = $('body').data('tiles-number-limit');

        RANDO.START_TIME = Date.now();

        var canvas = document.getElementById('canvas_renderer');
        var cameraID = "examine";
        var scene = new RANDO.Scene(canvas, cameraID);
        scene.init();
    }
};
