'use strict';

function Rando3DController(settingsFactory) {
    var pk = 903280;
    RANDO.SETTINGS.DEM_URL      = settingsFactory.treksUrl + pk + '/dem.json';
    RANDO.SETTINGS.PROFILE_URL  = settingsFactory.treksUrl + pk + '/profile.json';
    RANDO.SETTINGS.POI_URL      = settingsFactory.poisUrl + '?trekId=' + pk + '&format=geojson';
    RANDO.SETTINGS.TILE_TEX_URL = 'https://a.tiles.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png';
    RANDO.SETTINGS.SIDE_TEX_URL = '/mages/3d/side.jpg';
    RANDO.SETTINGS.CAM_SPEED_F  = 100;
    RANDO.SETTINGS.PICTO_PREFIX = '../';// +/media/upload/*.png

    RANDO.START_TIME = Date.now();

    var canvas = document.getElementById('canvas_renderer');
    var cameraID = 'examine';
    var scene = new RANDO.Scene(canvas, cameraID);
    scene.init();
}

module.exports = {
    Rando3DController: Rando3DController
};