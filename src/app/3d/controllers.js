'use strict';

function Rando3DController(result, $scope, $timeout, $modalInstance, globalSettings, loadRando3D, translationService, settingsFactory) {
    $scope.result = result;
    $scope.isLoading = false;
    var loadingCallback = function () {
        $timeout(function () {
            $scope.isLoading = false;
        });
    };

    function init3D () {
        $scope.isLoading = true;
        var pk = result.id;
        var currentLang = translationService.getCurrentLang();
        var customSettings = {
            IMAGES_FOLDER: '/images/3d/',
            DEM_URL: settingsFactory.trekUrl.replace(/\$lang/, currentLang) + pk + '/' + globalSettings.DEM_FILE,
            PROFILE_URL: settingsFactory.trekUrl.replace(/\$lang/, currentLang) + pk + '/' + globalSettings.PROFILE_FILE,
            POI_URL: settingsFactory.trekUrl.replace(/\$lang/, currentLang) + pk + '/' + globalSettings.POI_FILE,
            TILE_TEX_URL: globalSettings.ORTHOPHOTO_TILELAYERS.LAYER_URL,
            SIDE_TEX_URL: "/images/3d/side.jpg",
            CAM_SPEED_F: 100,
            PICTO_PREFIX: globalSettings.API_URL,
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
        scene.init(loadingCallback);
    }

    loadRando3D.then(function() {
        window.rando3D = require('rando3D');
        $timeout(init3D);
    });

    $scope.close = function () {
        $modalInstance.dismiss('close');
    };

}

module.exports = {
    Rando3DController: Rando3DController
};