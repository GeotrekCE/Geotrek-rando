// Rando.Builds.js
// Builders of zone and route

var RANDO = RANDO || {};
RANDO.Builds = {};

/**
 *
 *
 *
 *
 *
 */
RANDO.Builds.launch = function(window, jQuery, canvas) {
    // Load BABYLON 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    window.addEventListener("resize", function(){
        engine.resize();
    });

    // Creation of the scene
    var scene = new BABYLON.Scene(engine);

    // Camera
    var camera = RANDO.Builds.camera(scene);

    // Lights
    var lights = RANDO.Builds.lights(scene);

    var grid2D, translateXY = {
        x : 0,
        y : 0
    };

    var dem;
    jQuery.getJSON(RANDO.SETTINGS.DEM_URL)
    .done(function (data) {
        var extent = RANDO.Utils.getExtent(data.extent);
        var ll_center = RANDO.Utils.toMeters(data.center);
        console.log(data);
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
            dem
        );
     })
    .then(function () {
        return jQuery.getJSON(RANDO.SETTINGS.PROFILE_URL);
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
            RANDO.SETTINGS.TREK_OFFSET,
            0
        );

        // Route building
        RANDO.Builds.route(scene, vertices);
    }
    );

    scene.activeCamera.attachControl(canvas);

    // Once the scene is loaded, just register a render loop to render it
    engine.runRenderLoop(function () {
        //RANDO.Utils.refreshPanels(vertices.length, scene);
        scene.render();
    });

    scene.executeWhenReady(function () {
        console.log("Scene is ready ! " + (Date.now() - START_TIME) );
        // texture
        if(scene.getMeshByName("Zone") && RANDO.SETTINGS.TEXTURE_URL){
            var material = scene.getMeshByName("Zone").material;
            material.diffuseTexture =  new BABYLON.Texture(
                RANDO.SETTINGS.TEXTURE_URL,
                scene
            );
            material.wireframe = false;
        }
    });
    return scene;
};

/**
 * zone() : build a heightMap from a DEM corresponding of zone around a troncon
 *      - scene (BABYLON.Scene) : current scene
 *      - data (Dictionnary)    : dictionnary containing :
 *              * center of DEM
 *              * resolution of DEM
 *              * vertices
 *      - texture (BABYLON.Texture) : texture which will be applied  **optionnal**
 *      - cam_b (Boolean)       : settings of camera **optionnal**
 *
 */
RANDO.Builds.zone = function(scene, data, cam_b){
    if(typeof(texture)==='undefined') texture = null;
    if(typeof(cam_b)==='undefined') cam_b = true;
    console.log("DEM building... " + (Date.now() - START_TIME) );
    var center = data.center;
    var resolution = data.resolution;
    var vertices = data.vertices;

    // Camera
    if (cam_b){
        scene.activeCamera.rotation = new BABYLON.Vector3(0.6, 1, 0);
        scene.activeCamera.position = new BABYLON.Vector3(
            center.x-2000,
            center.y+500,
            center.z-1500
        );
    }
    // Material
    var material =  new BABYLON.StandardMaterial("GroundMaterial", scene);
    material.backFaceCulling = false;
    material.wireframe = true;

    // Create Zone
    var zone = RANDO.Utils.createGround(
        "Zone",
        10,
        10,
        resolution.x-1,
        resolution.y-1,
        scene
    );
    console.assert(
        zone.getVerticesData(BABYLON.VertexBuffer.PositionKind).length == vertices.length,
        zone.getVerticesData(BABYLON.VertexBuffer.PositionKind).length + " != " + vertices.length
    );

    zone.material = material;
    zone.setVerticesData(vertices, BABYLON.VertexBuffer.PositionKind);

    console.log("DEM built ! " + (Date.now() - START_TIME) );
}

/**
* route() : build a troncon from an array of point
*       - scene (BABYLON.Scene) : current scene
*       - vertices : array of vertices
*       - cam_b (bool): settings of camera **optionnal**
*       - lin_b (bool): using of "line" meshes (kind of ribbon) **optionnal**
*       - sph_b (bool): using of sphere meshes **optionnal**
*       - cyl_b (bool): using of cylinder meshes **optionnal**
*       - pan_b (bool): using of panel meshes to display informations **optionnal**
*/
RANDO.Builds.route = function(scene, vertices, lin_b, sph_b, cyl_b, pan_b ){
    if(typeof(lin_b)==='undefined') lin_b = false;
    if(typeof(sph_b)==='undefined') sph_b = true;
    if(typeof(cyl_b)==='undefined') cyl_b = true;
    if(typeof(pan_b)==='undefined') pan_b = false;

    RANDO.Utils.animateCamera(vertices, scene);

    console.log("Trek building... " + (Date.now() - START_TIME) );

    // With Cylinder meshes
    if (cyl_b){
        var cyl_diameter = RANDO.SETTINGS.TREK_WIDTH;
        var cyl_tessel = 10;
        var cyl_material = new BABYLON.StandardMaterial("CylinderMaterial", scene);
        cyl_material.diffuseColor = RANDO.SETTINGS.TREK_COLOR;
        //cyl_material.ambientColor = RANDO.SETTINGS.TREK_COLOR;
        //cyl_material.specularColor = RANDO.SETTINGS.TREK_COLOR;

        for (var i = 0; i < vertices.length-1; i++){
            var A = new BABYLON.Vector3(
                vertices[i].x,
                vertices[i].y,
                vertices[i].z
            );
            var B = new BABYLON.Vector3(
                vertices[i+1].x,
                vertices[i+1].y,
                vertices[i+1].z
            );
            var cyl_height = BABYLON.Vector3.Distance(A,B);

            var cylinder = BABYLON.Mesh.CreateCylinder(
                "Cylinder" + (i+1),
                cyl_height,
                cyl_diameter,
                cyl_diameter,
                cyl_tessel,
                scene
            );
            cylinder.material = cyl_material;

            // Place the cylinder between the current point A and the next point B
            cylinder = RANDO.Utils.placeCylinder(cylinder, A, B);
        }
    }//------------------------------------------------------------------

    // Spheres for each point
    if (sph_b){
        // Create Sphere
        var sph_diam = RANDO.SETTINGS.TREK_WIDTH;
        var sph_material = new BABYLON.StandardMaterial("SphereMaterial", scene);
        sph_material.diffuseColor = RANDO.SETTINGS.TREK_COLOR;
        for(it in vertices){
            var sphere = BABYLON.Mesh.CreateSphere("Sphere" + it, 5, sph_diam, scene);
            sphere.material = sph_material;
            sphere.position = new BABYLON.Vector3(
                vertices[it].x,
                vertices[it].y,
                vertices[it].z
            );
        }
    }//------------------------------------------------------------------

    // Panel for each point which indicates infos about point
    if (pan_b){
        // Create Panel
        var pan_offset = 3;
        var pan_size = 10;
        var pan_info = {
            'policy' : "bold 50px Arial",
            'color'  : "red"
        };
        var it =0;

        var intervalID = window.setInterval(function(){
            var pan_material = new BABYLON.StandardMaterial("Panel" + it, scene);
            pan_material.backFaceSculling = false;
            var panel = BABYLON.Mesh.CreatePlane("Panel" + it, pan_size , scene);
            panel.material = pan_material;
            panel.position = new BABYLON.Vector3(
                vertices[it].x,
                vertices[it].y,
                vertices[it].z
            );

            var texture = new BABYLON.DynamicTexture("dynamic texture" +it, 512, scene, true);
            panel.material.diffuseTexture = texture;
            texture.hasAlpha = true;
            texture.drawText("Point "+ it+ " : "+ vertices[it].y +" m",
                50, 100, pan_info.policy, pan_info.color,
                null
            );

            if(it < vertices.length-1)
                it++;
            else
                window.clearInterval(intervalID);
        }, 1);

    }//------------------------------------------------------------------

    console.log("Trek built ! " + (Date.now() - START_TIME) );
}

/**
 * cardinals() : build the NW, NE, SE and SW extrems points of the DEM with spheres
 *
 *      - extent : contain the four corners of the DEM
 *      - scene  : current scene
 *
 * NB : each point have its own color
 *          NW --> White
 *          NE --> Red
 *          SE --> Blue
 *          SW --> Green
 *
 */
RANDO.Builds.cardinals = function(extent, scene){

    var tmp;
    var sph_diam = 20;
    var matA = new BABYLON.StandardMaterial("SphereMaterial", scene);
    var A = BABYLON.Mesh.CreateSphere("SphereA", 5, sph_diam, scene);
    tmp = extent.northwest;
    A.position.x = tmp.x;
    A.position.y = 1500;
    A.position.z = tmp.y;
    matA.diffuseColor = new BABYLON.Color3(255,255,255);
    A.material = matA;

    var matB = new BABYLON.StandardMaterial("SphereMaterial", scene);
    var B = BABYLON.Mesh.CreateSphere("SphereB", 5, sph_diam, scene);
    tmp = extent.northeast;
    B.position.x = tmp.x;
    B.position.y = 1500;
    B.position.z = tmp.y;
    matB.diffuseColor = new BABYLON.Color3(255,0,0);
    B.material = matB;

    var matC = new BABYLON.StandardMaterial("SphereMaterial", scene);
    var C = BABYLON.Mesh.CreateSphere("SphereC", 5, sph_diam, scene);
    tmp = extent.southeast;
    C.position.x = tmp.x;
    C.position.y = 1500;
    C.position.z = tmp.y;
    matC.diffuseColor = new BABYLON.Color3(0,0,255);
    C.material = matC;

    var matD = new BABYLON.StandardMaterial("SphereMaterial", scene);
    var D = BABYLON.Mesh.CreateSphere("SphereD", 5, sph_diam, scene);
    tmp = extent.southwest;
    D.position.x = tmp.x;
    D.position.y = 1500;
    D.position.z = tmp.y;
    matD.diffuseColor = new BABYLON.Color3(0,255,0);
    D.material = matD;


}

/**
 *  camera() : initialize main parameters of camera
 *      - scene : the current scene
 *
 *  return the camera
 * */
RANDO.Builds.camera = function(scene){
    var camera  = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
    camera.checkCollisions = true;
    camera.maxZ = 10000;
    camera.speed = RANDO.SETTINGS.CAM_SPEED_F ;
    camera.keysUp = [90, 38]; // Touche Z
    camera.keysDown = [83, 40]; // Touche S
    camera.keysLeft = [81, 37]; // Touche Q
    camera.keysRight = [68, 39]; // Touche D
    var l_cam = new BABYLON.HemisphericLight("LightCamera", new BABYLON.Vector3(0,1000,0), scene)
    l_cam.intensity = 0.8;
    l_cam.parent = camera;
    return camera;
}

/**
 *  lights() : initialize main parameters of lights
 *      - scene : the current scene
 *
 *  return an array containing all lights
 * */
RANDO.Builds.lights = function(scene){
    var lights = [];

    // Sun
    var sun = new BABYLON.HemisphericLight("Sun", new BABYLON.Vector3(500, 2000, 0), scene);

    lights.push(sun);
    return lights;
}
