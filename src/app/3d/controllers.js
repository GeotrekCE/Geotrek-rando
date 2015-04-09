'use strict';

function Rando3DController(result, $scope, $timeout, globalSettings, settingsFactory) {
    console.log(result);
    $scope.result = result;
    function init3D() {
        var pk = result.id;
        var customSettings = {
            IMAGES_FOLDER: 'images/3d/',
            DEM_URL: settingsFactory.trekUrl + pk + "/dem.json",
            PROFILE_URL: settingsFactory.trekUrl + pk + "/profile.json",
            POI_URL: settingsFactory.poisUrl + '?format=geojson&trek=' + pk,
            TILE_TEX_URL: "https://a.tiles.mapbox.com/v3/makina-corpus.i3p1001l/{z}/{x}/{y}.png",
            SIDE_TEX_URL: "/images/3d/side.jpg",
            CAM_SPEED_F: 100,
            PICTO_PREFIX: globalSettings.DOMAIN,
            TREK_COLOR: {
                R: 0.6,
                V: 0.1,
                B: 0.1
            }
        };

        var canvas = document.getElementById('canvas_renderer');
        var cameraID = "examine";
        var app3D = new Rando3D();
        var scene = app3D.init(customSettings, canvas, cameraID);
        console.log(scene);
        scene.init();    
    }

    $timeout(init3D, 500);
    
}

module.exports = {
    Rando3DController: Rando3DController
};