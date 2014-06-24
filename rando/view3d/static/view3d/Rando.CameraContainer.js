/*******************************************************************************
 * Rando.CameraContainer.js
 * 
 * CameraContainer class : 
 *  A container which will contains all cameras of the scene
 * 
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict" 
    
    /* Constructor */
    RANDO.CameraContainer = function (canvas, scene, params) {
        this._canvas    = canvas;
        this._scene     = scene;
        this._switchEnabled     = params.switchEnabled || false;
        this._demCenter         = _.clone(params.demCenter) || BABYLON.Vector3.Zero();
        this._demExtent         = _.clone(params.demExtent) || BABYLON.Vector3.Zero();
        this._offsets           = params.offsets || BABYLON.Vector3.Zero();

        this.cameras    = {};

        this._animationPath = null;
        this._controlsAttached  = false;
        this._positionBeforeSwitch = null;
        this._targetBeforeSwitch = null;

        this.initialPosition    = BABYLON.Vector3.Zero();
        this.initialTarget      = BABYLON.Vector3.Zero();
        this.lowerXLimit        = null;
        this.lowerZLimit        = null;
        this.upperXLimit        = null;
        this.upperZLimit        = null;
        this.lowerRadiusLimit   = null;
        this.upperRadiusLimit   = null;

        this.init();
    };

    // Static Array defining possibles cameras IDs
    RANDO.CameraIDs = ["examine_camera", "bird_camera", "hiker_camera"];

    /* Methods */
    RANDO.CameraContainer.prototype.init = function () {
        this._computeInitialParameters ();
        this._buildBirdCamera ();
        this._buildExamineCamera ();
        this._buildHikerCamera ();
        this._initInterface();
        this._cameraSwitcher ();
    };

    /**
     * RANDO.CameraContainer._buildExamineCamera() : build of the Examine camera
     */
    RANDO.CameraContainer.prototype._buildExamineCamera = function () {
        var examine_camera = new RANDO.ExamineCamera(
            "Examine Camera",0, 0, 0,
            this.initialTarget,
            this._scene
        );
        examine_camera.id = "examine_camera";
        examine_camera.keysUp     = [90, 38]; // Touche Z and up
        examine_camera.keysDown   = [83, 40]; // Touche S and down
        examine_camera.keysLeft   = [81, 37]; // Touche Q and left
        examine_camera.keysRight  = [68, 39]; // Touche D and right

        examine_camera.wheelPrecision = 0.2;
        examine_camera.checkCollisions = true;
        examine_camera.ellipsoid.y = RANDO.SETTINGS.COLLISIONS_OFFSET;
        examine_camera.maxZ = 10000;
        examine_camera.speed = RANDO.SETTINGS.CAM_SPEED_F ;
        
        examine_camera.lowerXLimit = this.lowerXLimit;
        examine_camera.lowerZLimit = this.lowerZLimit;
        examine_camera.upperXLimit = this.upperXLimit;
        examine_camera.upperZLimit = this.upperZLimit;
        examine_camera.upperRadiusLimit    = this.upperRadiusLimit;
        examine_camera.upperBetaLimit = Math.PI/2;

        this.cameras.examine_camera = examine_camera;
    };

    /**
     * RANDO.CameraContainer._buildBirdCamera() : build of the Bird camera
     */
    RANDO.CameraContainer.prototype._buildBirdCamera = function () {
        var bird_camera = new RANDO.BirdCamera(
            "Bird Camera", 
            BABYLON.Vector3.Zero(),
            this._scene
        );
        bird_camera.id = "bird_camera";
        bird_camera.keysUp     = [90, 38]; // Touche Z and up
        bird_camera.keysDown   = [83, 40]; // Touche S and down
        bird_camera.keysLeft   = [81, 37]; // Touche Q and left
        bird_camera.keysRight  = [68, 39]; // Touche D and right

        bird_camera.checkCollisions = true;
        bird_camera.ellipsoid.y = RANDO.SETTINGS.COLLISIONS_OFFSET;
        bird_camera.maxZ = 10000;
        bird_camera.speed = RANDO.SETTINGS.CAM_SPEED_F ;

        this.cameras.bird_camera = bird_camera;
    };

    /**
     * RANDO.CameraContainer._buildHikerCamera() : build of the Hiker camera
     */
    RANDO.CameraContainer.prototype._buildHikerCamera = function () {
        var hiker_camera = new RANDO.HikerCamera(
            "Hiker Camera", 
            BABYLON.Vector3.Zero(),
            this._scene
        );
        hiker_camera.id = "hiker_camera";

        hiker_camera.checkCollisions = true;
        hiker_camera.maxZ = 10000;

        hiker_camera.returnSpeed = RANDO.SETTINGS.HCAM_RETURN_SPEED;
        hiker_camera.followSpeed = RANDO.SETTINGS.HCAM_FOLLOW_SPEED;
        

        this.cameras.hiker_camera = hiker_camera;
    };

    /**
     * RANDO.CameraContainer.setActiveCamera() : set the active camera of the scene
     *      - newID: ID of the camera we want to set as active
     * 
     * NB : newID should be in the static array RANDO.cameraIDs
     */
    RANDO.CameraContainer.prototype.setActiveCamera = function (newID) {
        if (RANDO.CameraIDs.indexOf(newID) == -1) {
            console.error("RANDO.CameraContainer.setActiveCamera () : " + newID + 
                            " is not an available camera's ID");
            return;
        }

        var oldID = this._scene.activeCamera.id;

        // Record informations of the old camera
        this._recordInfoBeforeSwitch(oldID);

        // Attach & detach controls of cameras
        if (this._controlsAttached) {
            this.cameras[oldID].detachControl();
        }
        this.cameras[newID].attachControl(this._canvas);
        this._controlsAttached = true;

        // Update camera
        this._scene.setActiveCameraByID (newID);
        this._resetByDefault();

        // Interface changings
        $(".controls--" + oldID).css("display", "none");
        $("#" + oldID)[0].className = "camera" ;
        $(".controls--" + newID).css("display", "block");
        $("#" + newID)[0].className = "camera camera--selected" ;
    };

    RANDO.CameraContainer.prototype._recordInfoBeforeSwitch = function (oldID) {
        if (oldID == "examine_camera") {

            this._positionBeforeSwitch  = this._scene.activeCamera.position.clone();
            this._targetBeforeSwitch    = this._scene.activeCamera.target.clone();
            this._rotationBeforeSwitch  = null;
        } else if (oldID == "bird_camera" || oldID == "hiker_camera") {

            this._positionBeforeSwitch  = this._scene.activeCamera.position.clone();
            this._rotationBeforeSwitch  = this._scene.activeCamera.rotation.clone();
            this._targetBeforeSwitch    = null;
        }
    };
    
    RANDO.CameraContainer.prototype.setAnimationPath = function (vertices) {
        this._animationPath = vertices;

        var hiker_camera = this.cameras.hiker_camera;
        hiker_camera.setPath(vertices);
    };

    RANDO.CameraContainer.prototype._cameraSwitcher = function () {
        var idArray = RANDO.CameraIDs;
        var that = this;

        if (!this._switchEnabled) {
            return;
        }
        else {
             $(".camera_switcher").css("display", "block");
        }

        for (var it in idArray) {
            $("#" + idArray[it]).on("click", function () {
                that.setActiveCamera (this.id);
            });
        }
    };

    RANDO.CameraContainer.prototype._resetByDefault = function () {
        var activeCam = this._scene.activeCamera;

        // Examine Camera
        if (activeCam.id == "examine_camera") {
            activeCam.setPosition(this.initialPosition.clone());
            activeCam.target = this.initialTarget.clone();
        }

        // Bird Camera
        else if (activeCam.id == "bird_camera") {
            activeCam.position = this.initialPosition.clone();
            activeCam.setTarget(this.initialTarget.clone());
        }

        // Hiker Camera
        else if (activeCam.id == "hiker_camera" ) {
            if (this._positionBeforeSwitch) {
                activeCam.position = this._positionBeforeSwitch;
            } 
            if (this._rotationBeforeSwitch) {
                activeCam.rotation = this._rotationBeforeSwitch;
            }
            if (this._targetBeforeSwitch) {
                activeCam.setTarget(this._targetBeforeSwitch);
            }
        }

        activeCam._reset ();
    };

    RANDO.CameraContainer.prototype._computeInitialParameters = function () {
        this._demCenter.x += this._offsets.x;
        this._demCenter.z += this._offsets.z;

        this.initialPosition.x = this._demCenter.x + 3000;
        this.initialPosition.y = this._demCenter.y + 1000;
        this.initialPosition.z = this._demCenter.z + 3000;

        this.initialTarget.x = this._demCenter.x;
        this.initialTarget.y = this._demExtent.y.min;
        this.initialTarget.z = this._demCenter.z;

        this.lowerXLimit = this._demExtent.x.min + this._offsets.x;
        this.upperXLimit = this._demExtent.x.max + this._offsets.x;
        this.lowerZLimit = this._demExtent.z.min + this._offsets.z;
        this.upperZLimit = this._demExtent.z.max + this._offsets.z;
        
        this.lowerRadiusLimit = RANDO.SETTINGS.MIN_THICKNESS + this._demCenter.y;
        this.upperRadiusLimit = 8000;
    };

    RANDO.CameraContainer.prototype._initInterface = function () {
        
        for (var it in this.cameras) {
            var id = this.cameras[it].id;
            $(".controls--" + id + " .description")
                .text(RANDO.SETTINGS.CAMERA_MESSAGES[id]);
            $("#" + id + " .description")
                .text(RANDO.SETTINGS.CAMERA_MESSAGES[id]);
        }
    };

})();
