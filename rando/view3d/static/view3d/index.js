/**
 *
 *  VARIABLES
 *
 * */
    var _CAM_OFFSET = 100;
    var _ALT_OFFSET = 2;

window.onload = function onload() {
    // Check support
    if (!BABYLON.Engine.isSupported()) {
        window.alert('Browser not supported');
        return;
    }

    var scene = null;
    _ID_SCENE = $('body').data('trek-id');
    var demUrl = $('body').data('dem-url'),
        profileUrl = $('body').data('profile-url');

    // Load BABYLON 3D engine
    var canvas = document.getElementById("canvas_renderer");
    var engine = new BABYLON.Engine(canvas, true);
    scene = createScene(engine);
    scene.activeCamera.attachControl(canvas);

    // Once the scene is loaded, just register a render loop to render it
    engine.runRenderLoop(function () {
        //RANDO.Utils.refreshPanels(vertices.length, scene);
        scene.render();
    });


    function createScene(engine){
         //Creation of the scene
        var scene = new BABYLON.Scene(engine);

        // Camera
        var camera = RANDO.Utils.initCamera(scene);

        var grid2D, translateXY = {
            x : 0,
            y : 0
        };

        var dem;

        $.getJSON(demUrl)
         .done(function (data) {
            var extent = RANDO.Utils.getExtent(data.extent);
            var ll_center = RANDO.Utils.toMeters(data.center);

            // Create grid
            grid2D = RANDO.Utils.createGrid(
                extent.southwest,
                extent.southeast,
                extent.northeast,
                extent.northwest,
                data.resolution.x,
                data.resolution.y
            );

            dem = {
                "extent"    :   extent,
                "vertices"  :   RANDO.Utils.getVerticesFromDEM(
                                    data.altitudes,
                                    grid2D
                                ),
                "resolution":   data.resolution,
                "center"    :   {
                                    x: ll_center.x,
                                    y: data.center.z,
                                    z: ll_center.y
                                }
            };
            translateXY.x = -dem.center.x;
            translateXY.y = -dem.center.z;

            RANDO.Utils.translateDEM(
                dem,
                translateXY.x,
                dem.extent.altitudes.min,
                translateXY.y
            );

            // Zone building
            RANDO.Builds.zone(
                scene,
                dem,
                null  // texture
            );
         })
        .then(function () {
            return $.getJSON(profileUrl);
        })
        .done(function (data) {
            var vertices = RANDO.Utils.getVerticesFromProfile(data.profile);
            // Translation of the route to make it visible
            RANDO.Utils.translateRoute(
                vertices,
                translateXY.x,
                0,
                translateXY.y
            );

            // Drape the route over the DEM
            RANDO.Utils.drape(vertices, scene);

            // Route just a bit higher to the DEM
            RANDO.Utils.translateRoute(
                vertices,
                0,
                _ALT_OFFSET,
                0
            );

            // Route building
            RANDO.Builds.route(scene, vertices);
        });

        return scene;
    }
};
