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

        this._computer = new RANDO.CameraComputer (
            params.demCenter,
            params.demExtent,
            params.demAltitudes,
            params.offsets || BABYLON.Vector3.Zero(),
            scene,
            6
        );

        this.cameras = {};

        this._animationPath = null;
        this._controlsAttached  = false;
        this._positionBeforeSwitch = null;
        this._targetBeforeSwitch = null;

        this.initialPosition    = BABYLON.Vector3.Zero();
        this.initialTarget      = BABYLON.Vector3.Zero();
        this.limits             = {
            'lowerX'        : null,
            'upperX'        : null,
            'lowerZ'        : null,
            'upperZ'        : null,
            'lowerRadius'   : null,
            'upperRadius'   : null
        };

        this.init();
    };

    // Static Array defining possibles cameras IDs
    RANDO.CameraIDs = ["examine", "bird", "hiker"];

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
        examine_camera.id = "examine";
        examine_camera.keysUp     = [90, 38]; // Touche Z and up
        examine_camera.keysDown   = [83, 40]; // Touche S and down
        examine_camera.keysLeft   = [81, 37]; // Touche Q and left
        examine_camera.keysRight  = [68, 39]; // Touche D and right

        examine_camera.wheelPrecision = 0.2;
        examine_camera.checkCollisions = true;
        examine_camera.ellipsoid.y = RANDO.SETTINGS.COLLISIONS_OFFSET;
        examine_camera.maxZ = 50000;
        examine_camera.speed = RANDO.SETTINGS.CAM_SPEED_F ;

        examine_camera.lowerXLimit = this.limits.lowerX;
        examine_camera.lowerZLimit = this.limits.lowerZ;
        examine_camera.upperXLimit = this.limits.upperX;
        examine_camera.upperZLimit = this.limits.upperZ;
        examine_camera.upperBetaLimit = Math.PI/2;

        this.cameras.examine = examine_camera;
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
        bird_camera.id = "bird";
        bird_camera.keysUp     = [90, 38]; // Touche Z and up
        bird_camera.keysDown   = [83, 40]; // Touche S and down
        bird_camera.keysLeft   = [81, 37]; // Touche Q and left
        bird_camera.keysRight  = [68, 39]; // Touche D and right

        bird_camera.checkCollisions = true;
        bird_camera.ellipsoid.y = RANDO.SETTINGS.COLLISIONS_OFFSET;
        bird_camera.maxZ = 50000;
        bird_camera.speed = RANDO.SETTINGS.CAM_SPEED_F ;

        this.cameras.bird = bird_camera;
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
        hiker_camera.id = "hiker";

        hiker_camera.checkCollisions = true;
        hiker_camera.maxZ = 50000;

        hiker_camera.returnSpeed = RANDO.SETTINGS.HCAM_RETURN_SPEED;
        hiker_camera.followSpeed = RANDO.SETTINGS.HCAM_FOLLOW_SPEED;


        this.cameras.hiker = hiker_camera;
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

        // Interface changes
        $(".controls--" + oldID).css("display", "none");
        $(".camera--"   + oldID).removeClass("camera--selected");
        $(".controls--" + newID).css("display", "block");
        $(".camera--"   + newID).addClass("camera--selected");
    };

    RANDO.CameraContainer.prototype._recordInfoBeforeSwitch = function (oldID) {
        if (oldID == "examine") {
            this._positionBeforeSwitch  = this._scene.activeCamera.position.clone();
            this._targetBeforeSwitch    = this._scene.activeCamera.target.clone();
            this._rotationBeforeSwitch  = null;
        } 
        else if (oldID == "bird" || oldID == "hiker") {
            this._positionBeforeSwitch  = this._scene.activeCamera.position.clone();
            this._rotationBeforeSwitch  = this._scene.activeCamera.rotation.clone();
            this._targetBeforeSwitch    = null;
        }
    };

    RANDO.CameraContainer.prototype.setAnimationPath = function (vertices) {
        this._animationPath = vertices;
        this.cameras.hiker.setPath(vertices);
        this.enableCamera ("hiker");
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
            // The hiker camera must not be active until his path has not been set
            if (idArray[it] != "hiker") {
                this.enableCamera(idArray[it]);
            }

            // Click event
            $(".camera--" + idArray[it]).click({id : idArray[it]}, function (e) {

                if($(this).hasClass('camera--disabled')) {
                    return;
                }
                else {
                    that.setActiveCamera (e.data.id);
                }
            });
        }
    };

    RANDO.CameraContainer.prototype.enableCamera = function (id) {
        $(".camera--" + id ).removeClass("camera--disabled");
        $(".camera--" + id ).addClass("camera--enabled");
        $(".camera--" + id + " img").attr("src", "img/"+ id +"_camera.png");
    };

    RANDO.CameraContainer.prototype._resetByDefault = function () {
        var activeCam = this._scene.activeCamera;

        // Examine Camera
        if (activeCam.id == "examine") {
            activeCam.setPosition(this.initialPosition.clone());
            activeCam.target = this.initialTarget.clone();
        }

        // Bird Camera
        else if (activeCam.id == "bird") {
            activeCam.position = this.initialPosition.clone();
            activeCam.setTarget(this.initialTarget.clone());
        }

        // Hiker Camera
        else if (activeCam.id == "hiker" ) {
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
        this._computer.computeInitialPositionToRef (this.initialPosition);

        this._computer.computeInitialTargetToRef (this.initialTarget);

        this._computer.computeLimitsToRef (this.limits);
    };

    RANDO.CameraContainer.prototype._initInterface = function () {
        for (var it in this.cameras) {
            var id = this.cameras[it].id;
            $(".controls--" + id + " .controls-description")
                .text(RANDO.SETTINGS.CAMERA_MESSAGES[id]);
            $(".camera--"   + id + " .camera-description")
                .text(RANDO.SETTINGS.CAMERA_MESSAGES[id]);
        }
    };
})();
