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
    RANDO.Scene = function (canvas, cameraID, version, settings) {
        // Attributes declaration 
        this._canvas    = canvas;
        this._cameraID  = cameraID;
        this._version   = version;
        this._settings  = settings;
        
        this._engine    = null;
        this._scene     = null;
        this.camContainer    = null;
        this.lights     = [];
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
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._scene  = new BABYLON.Scene(this._engine);
        var that = this;
        RANDO.Events.addEvent(window, "resize", function(){
            that._engine.resize();
        });
        
        if (typeof(this._settings) !== 'undefined') {
            RANDO.SETTINGS.parse(this._settings);
        }

        this._scene.collisionsEnabled = true;
        this._buildLights();
        this._buildEnvironment();
        
        switch (this._version) {
            case "1.0" : 
                console.log("Launch of version 1.0 ! ")
                this.process_v10();
            break;
            case "1.1" : 
                console.log("Launch of version 1.1 ! ")
                this.process();
            break;
            case "1.2" : 
                console.log("Launch of version 1.2 ! ")
                this.process();
        }
    };

    /**
     * RANDO.Scene.process_v10() : launch the building process of the scene 
     *  It displays : 
     *          - the terrain 
     *          - the trek 
     */
    RANDO.Scene.prototype.process_v10 = function () {
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

         // Tiled DEM mesh building
         .then(function () {
            that._engine.runRenderLoop(function() {
                that._scene.render();
            }); 
            that.dem = new RANDO.Dem(
                that._dem_data.extent,
                that._dem_data.altitudes,
                that._offsets,
                that._scene
            );
         })

         // Trek building
         .then(function () {
            that.trek = new RANDO.Trek  (
                that._trek_data,
                that._offsets,
                that._scene
            )
            that.trek.init();
         })

         .then(function () {
            that._scene.executeWhenReady(function () {
                that._executeWhenReady ();
            });
         });
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
                if (RANDO.Utils.isInExtent(that._pois_data[it].coordinates, that._dem_data.extent)) {
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
        var canvas          = this._canvas;
        var scene           = this._scene;
        var cameraID        = this._cameraID;
        var version         = this._version;

        var params = {
            'demCenter' : this._dem_data.center,
            'offsets'   : this._offsets,
            'demExtent' : this._dem_data.extent,
            'switchEnabled' : true
        };

        if (version == "1.2") {
            this.camContainer = new RANDO.CameraContainer(canvas, scene, params);
        } else {
            params.switchEnabled = false;
            this.camContainer = new RANDO.CameraContainer(canvas, scene, params);
        }

        // Defines active camera
        if (!$.inArray(cameraID, RANDO.CameraIDs))
            cameraID = "examine_camera";

        this.camContainer.setActiveCamera (cameraID);
    };

    /**
     * RANDO.Scene._buildLights() : builds the differents lights of the scene 
     */
    RANDO.Scene.prototype._buildLights = function () {
        var lights = this.lights;
        var scene = this._scene;

        // Sun
        var sun = new BABYLON.HemisphericLight(
            "Sun", 
            new BABYLON.Vector3(500, 2000, 0), 
            scene
        );
        sun.intensity = 2;
        sun.specular = new BABYLON.Color4(0, 0, 0, 0);

        lights.push(sun);
    };

    RANDO.Scene.prototype._buildEnvironment = function () {
        // Fog
        //~ this._scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        //~ this._scene.fogDensity = 0.00002;
        //~ this._scene.fogColor = new BABYLON.Color3(1, 1, 1);

        // Color : transparent to see the html background
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    };

    /**
     * RANDO.Scene._executeWhenReady() : function which is executed when the scene 
     *  is ready, in other words, when the scene have built all its elements.
     */
    RANDO.Scene.prototype._executeWhenReady = function () {
        console.log("Scene is ready ! " + (Date.now() - RANDO.START_TIME) );

        var scene           = this._scene;
        var dem             = this.dem;
        var trek            = this.trek;
        var camContainer    = this.camContainer;
        var pois            = this.pois;

        dem.applyTextures();
        trek.drape(dem.ground, onDrapeComplete);
        for (var it in pois) {
            pois[it].drape(dem.ground);
        }
        function onDrapeComplete () {
            // Updates trek vertices
            trek.updateVertices();

            camContainer.setAnimationPath(trek._vertices);

            // Merges the trek to increase performances
            trek.merge();
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

        // Record DEM altitudes scaled
        this._dem_data.altitudes = RANDO.Utils.scaleArray2(
            data.altitudes, 
            RANDO.SETTINGS.ALTITUDES_Z_SCALE
        );
        // Record DEM center
        this._dem_data.center = {
            'x' : m_center.x,
            'y' : data.center.z,
            'z' : m_center.y
        };

        // Records scene offsets
        this._offsets.x = -m_center.x;
        this._offsets.y =  m_extent.y.min;
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

            tmp = RANDO.Utils.toMeters(tmp);
            tmp.z = tmp.y;
            tmp.y = 0;

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
            var coordinates = RANDO.Utils.toMeters({
                'lng' : feature.geometry.coordinates[0],
                'lat' : feature.geometry.coordinates[1]
            });

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


