/*******************************************************************************
 * Rando.Scene.js
 *
 * Scene class :
 *  Permites the creation and manipulation of a scene 3D containing (or not) :
 *      - a Digital Elevation Model
 *      - a Trek which is draped over the DEM
 *      - a set of Points Of Interest draped over the DEM too
 *      - a set of Cameras
 *      - a set of lights
 *
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict"

    /* Constructor */
    RANDO.Scene = function (canvas, cameraID) {
        // Attributes declaration
        this._canvas    = canvas;
        this._cameraID  = cameraID;

        this._engine    = null;
        this._scene     = null;
        this.camContainer    = null;
        this.lights     = {};
        this.dem        = null;
        this.trek       = null;
        this.pois       = [];

        this._dem_data  = {};
        this._trek_data = [];
        this._pois_data = [];
        this._offsets   = {};
    };


    /* Methods */
    RANDO.Scene.prototype.init = function () {
        RANDO.START_TIME = Date.now();
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene  = new BABYLON.Scene(this._engine);
        var that = this;
        RANDO.Events.addEvent(window, "resize", function(){
            that._engine.resize();
        });

        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
        this._scene.collisionsEnabled = true;
        this._buildLights();
        this.process();
    };

    /**
     * RANDO.Scene.process() : launch the building process of the scene
     *  It displays :
     *          - Terrain
     *          - Trek
     *          - POIs
     */
    RANDO.Scene.prototype.process = function () {
        var that = this;

        $.getJSON(RANDO.SETTINGS.DEM_URL)
         .done(function (data) {
            that._parseDemJson(data);
            that._buildCameras();
         })
         .then(function () {
            return $.getJSON(RANDO.SETTINGS.PROFILE_URL);
         })
         .done(function (data) {
            that._parseTrekJson(data);
         })
         .then(function () {
            return $.getJSON(RANDO.SETTINGS.POI_URL);
         })
         .done(function (data) {
            that._parsePoiJson(data);

         })
         .then(function () {
            // Run renderloop
            that._engine.runRenderLoop(function() {
                that._scene.render();
            });

            // Tiled DEM mesh building
            that.dem = new RANDO.Dem(
                that._dem_data.extent,
                that._dem_data.altitudes,
                that._offsets,
                that._scene
            );

            // Trek building
            that.trek = new RANDO.Trek  (
                that._trek_data,
                that._offsets,
                that._scene
            );

            // POIs building
            var id = 0;
            for (var it in that._pois_data) {
                if (RANDO.Utils.isInExtent(that._pois_data[it].coordinates, that.dem.getRealExtent())) {
                    that.pois.push(new RANDO.Poi(
                        id++,
                        that._pois_data[it],
                        that._offsets,
                        that._scene
                    ));
                }
            }
            RANDO.Poi.runMouseListener(that._canvas, that.pois, that._scene);

            // To execute when scene is ready
            that._scene.executeWhenReady(function () {
                that._executeWhenReady ();
            });
         })
    };

    /**
     * RANDO.Scene._buildCameras() : builds cameras of the scene
     *
     *  If the camera ID is not available, it is changed to "demo_camera"
     */
    RANDO.Scene.prototype._buildCameras = function () {
        // Parameters for the Camera Container
        var params = {
            'demCenter' : this._dem_data.center,
            'offsets'   : this._offsets,
            'demExtent' : this._dem_data.extent,
            'demAltitudes': this._dem_data.altitudes,
            'switchEnabled' : true
        };

        // Instantiate the container
        this.camContainer = new RANDO.CameraContainer(this._canvas, this._scene, params);

        // Control camera ID entered (examine_camera by default)...
        if (!$.inArray(this._cameraID, RANDO.CameraIDs))
            this._cameraID = "examine";

        // ...and set it as active
        this.camContainer.setActiveCamera (this._cameraID);
    };

    /**
     * RANDO.Scene._buildLights() : builds the differents lights of the scene
     */
    RANDO.Scene.prototype._buildLights = function () {
        var scene = this._scene;

        // Sun
        this.lights.sun = light (
            "Sun", new BABYLON.Vector3(-500, -10000, 0), 1.2
        );

        // Side Light 1
        this.lights.sideLight1 = light (
            "Side Light 1", new BABYLON.Vector3(1, 0, 0.8), 1.2
        );

        // Side Light 2
        this.lights.sideLight2 = light (
            "Side Light 2", new BABYLON.Vector3(-1, 0, -0.8), 1.2
        );

        // light() : return a directional light
        function light (name, direction, intensity) {
            var light = new BABYLON.DirectionalLight(
                name,
                direction,
                scene
            );
            light.intensity = intensity;
            light.specular = new BABYLON.Color4(0, 0, 0, 0);
            return light;
        }
    };

    /**
     * RANDO.Scene._executeWhenReady() : function which is executed when the scene
     *  is ready, in other words, when the scene have built all its elements.
     */
    RANDO.Scene.prototype._executeWhenReady = function () {
        console.log("Scene is ready ! " + (Date.now() - RANDO.START_TIME) );

        var trek            = this.trek;
        var camContainer    = this.camContainer;
        var lights          = this.lights;

        // Init sidelights excluded meshes arrays with the tiles
        lights.sideLight1.excludedMeshes = this.dem.ground.getChildren();
        lights.sideLight2.excludedMeshes = this.dem.ground.getChildren();

        // Apply DEM textures
        this.dem.applyTextures();

        // Drape the trek with an onComplete callback
        trek.drape(this.dem.ground, onDrapeComplete);

        // Drape POIS
        for (var it in this.pois) {
            this.pois[it].drape(this.dem.ground);
        }

        function onDrapeComplete () {
            // Updates trek vertices ...
            trek.updateVertices();

            // ... to give them to the camera container (for hiker camera)
            camContainer.setAnimationPath(trek._vertices);

            // Merges the trek to increase performances
            trek.merge();

            // Update excluded meshes of lights
            $.merge(lights.sideLight1.excludedMeshes, trek.mergedTreks);
            $.merge(lights.sideLight2.excludedMeshes, trek.mergedTreks);
        }
    };

    /**
     * RANDO.Scene._parseDemJson() : parse data from the DEM json
     *      - data : data from DEM json
     */
    RANDO.Scene.prototype._parseDemJson = function (data) {
        // Conversions
        var m_center = RANDO.Utils.toMeters(data.center);
        var m_extent = RANDO.Utils.getMetersExtent (data.extent);

        // Record DEM extent
        this._dem_data.extent = m_extent;
        this._dem_data.extent.y.min *= RANDO.SETTINGS.ALTITUDES_Z_SCALE;
        this._dem_data.extent.y.max *= RANDO.SETTINGS.ALTITUDES_Z_SCALE;

        // Record DEM altitudes scaled
        this._dem_data.altitudes = RANDO.Utils.scaleArray2(
            data.altitudes,
            RANDO.SETTINGS.ALTITUDES_Z_SCALE
        );

        // Record DEM center
        this._dem_data.center = {
            'x' : m_center.x,
            'y' : (this._dem_data.extent.y.min + this._dem_data.extent.y.max) / 2,
            'z' : m_center.y
        };

        // Records scene offsets
        this._offsets.x = -m_center.x;
        this._offsets.z = -m_center.y;
    };

    /**
     * RANDO.Scene._parseTrekJson() : parse data from the Trek profile json
     *      - data : data from Trek profile json
     */
    RANDO.Scene.prototype._parseTrekJson = function (data) {

        for (var it in data.profile){
            var tmp = {
                'lng' : data.profile[it][2][0],
                'lat' : data.profile[it][2][1]
            };

            // We take only x and z values (not the altitudes)
            tmp = RANDO.Utils.toMeters(tmp);

            // toMeters() give x-y-coordinates and babylon take x-z-coordinates
            tmp.z = tmp.y;
            delete tmp["y"];

            // Record
            this._trek_data.push(tmp);
        }
    };

    /**
     * RANDO.Scene._parsePoiJson() : parse data from the POI json
     *      - data : data from POI json
     */
    RANDO.Scene.prototype._parsePoiJson = function (data) {
        for (var it in data.features) {
            var feature = data.features[it];

            // Conversion
            var coordinates = RANDO.Utils.toMeters({
                'lng' : feature.geometry.coordinates[0],
                'lat' : feature.geometry.coordinates[1]
            });

            // Record
            this._pois_data.push ({
                'coordinates' : {
                    'x': coordinates.x,
                    'z': coordinates.y
                },
                'properties' : feature.properties
            });
        }
    };
})();


