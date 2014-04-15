RANDO = RANDO || {};
RANDO.Scene = {};


var scene;

/**
 * launch():  launch the building of the DEM and trek from 2 json files
 *
 *      - canvas: canvas in which we build the scene
 */
RANDO.Scene.launch = function(canvas){
    // Check support
    if (!BABYLON.Engine.isSupported()) {
        return null;
    }

    // Load BABYLON 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    RANDO.Events.addEvent(window, "resize", function(){
        engine.resize();
    });

    // Creation of the scene
    scene = new BABYLON.Scene(engine);

    // Camera
    var camera = RANDO.Builds.Camera(scene);

    // Lights
    var lights = RANDO.Builds.Lights(scene);

    var offsets = {
        x : 0,
        z : 0
    };

    $.getJSON(RANDO.SETTINGS.DEM_URL)
     .done(function (data) {
        var m_extent = RANDO.Utils.getExtentinMeters(data.extent);
        var m_center = RANDO.Utils.toMeters(data.center);

        // Records DEM data
        var dem = {
            "extent"    :   m_extent,
            "altitudes"  :  data.altitudes, // altitudes already in meters
            "resolution":   data.resolution,// reso already in meters
            "center"    :   {
                x: m_center.x,
                y: data.center.z,// alt of center already in meters
                z: m_center.y
            }
        };

        // Control if altitudes data coincide with resolution data
        console.assert(dem.altitudes.length == dem.resolution.y);
        console.assert(dem.altitudes[0].length == dem.resolution.x);

        // Records offsets
        offsets.x = -dem.center.x;
        offsets.z = -dem.center.z;

        // Translation of the DEM
        RANDO.Utils.translateDEM(
            dem,
            offsets.x,
            dem.extent.altitudes.min,
            offsets.z
        );

        // DEM mesh building
        RANDO.Builds.DEM(
            dem,
            scene
        );

        //~ // Tiled DEM mesh building
        //~ RANDO.Builds.TiledDEM(
            //~ dem,
            //~ scene
        //~ );
     })
     .then(function () {
        // Render the DEM
        scene.render();
        return $.getJSON(RANDO.SETTINGS.PROFILE_URL);
     })
     .done(function (data) {
        var vertices = RANDO.Utils.getVerticesFromProfile(data.profile);

        // Translation of the route to make it visible
        RANDO.Utils.translateTrek(
            vertices,
            offsets.x,
            0,
            offsets.z
        );

        // Route building
        RANDO.Builds.Trek(scene, vertices);
     })
     .then(function () {
        scene.executeWhenReady(function () {
            executeWhenReady(canvas);
        });
     });

    return scene;
};


function renderLoop () {
    scene.getEngine().runRenderLoop(function() {
        scene.render();
    });
};


function executeWhenReady (canvas) {
    // Attach camera controls
    scene.activeCamera.attachControl(canvas);

    console.log("Scene is ready ! " + (Date.now() - START_TIME) );
    var dem = scene.getMeshByName("Digital Elevation Model");
    var trek_length = scene.getMeshByName("Spheres").getChildren().length;

    console.log("Trek adjustments ..." + (Date.now() - START_TIME) );

    var index = 0;
    var chunk = 100; // By chunks of 100 points
    drape();

    // Drape vertices (spheres) over the DEM
    function drape(){
        var cnt = chunk;
        while (cnt-- && index < trek_length) {
            RANDO.Utils.drapePoint(scene.getMeshByName("Sphere " + (index+1)).position, dem);
            ++index;
        }
        if (index < trek_length){
            setTimeout(drape, 1);
        }else {
            // At the end of draping we place cylinders
            setTimeout(place, 1);
        }
    }

    // Place all cylinders between each pairs of spheres
    function place() {
        for (var i = 0; i < trek_length-1; i++) {
            RANDO.Utils.placeCylinder(
                scene.getMeshByName("Cylinder " + (i+1)),
                scene.getMeshByName("Sphere "   + (i+1)).position,
                scene.getMeshByName("Sphere "   + (i+2)).position
            );
        }
        console.log("Trek adjusted ! " + (Date.now() - START_TIME) );

        // At the end, run the render loop
        renderLoop();
    }
};
