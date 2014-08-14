/*******************************************************************************
 * Rando.Poi.js
 *
 * Poi class :
 *  Permites the build of a Point of Interest in 3D
 *
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict"

    /* Constructor */
    RANDO.Poi = function (id, data, offsets, scene) {
        this._id            = id
        this._position      = {
            'x' : data.coordinates.x + offsets.x,
            'y' : 0,
            'z' : data.coordinates.z + offsets.z
        };
        this._name          = data.properties.name;
        this._type          = data.properties.type;
        this._elevation     = data.properties.elevation;
        this._description   = data.properties.description || RANDO.SETTINGS.NO_DESCRIPTION_MESSAGE;
        this._scene         = scene;

        this.panel          = null;
        this.picto          = null;
        this.sphere         = null;
        this._attachedLight = null;
        this.init();
    };

    RANDO.Poi.prototype.init = function () {
        this._buildPanel ();
        this._buildSphere ();

        var that = this;
        this._scene.registerBeforeRender( function () {
            that._registerBeforeRender();
        });
    };

    /**
     * RANDO.Poi._buildPanel() : build a Panel with a picto which defines the type of POI
     */
    RANDO.Poi.prototype._buildPanel = function () {
        var scene       = this._scene;
        var position    = this._position;
        var text        = this._name;
        var src         = RANDO.SETTINGS.PICTO_PREFIX + this._type.pictogram;
        var id          = this._id;
        var elevation   = this._elevation;

        // Size of panel (in pixel and in meters)
        var pan_size = {
            px: {
                width : 512,
                height : 512
            },
            m: {
                width : RANDO.SETTINGS.PICTO_SIZE,
                height : RANDO.SETTINGS.PICTO_SIZE + 30
            }
        };
        // Size of the pictogram (in pixels)
        var picto_size = {
            width : pan_size.px.width,
            height : pan_size.px.height * RANDO.SETTINGS.PICTO_SIZE / pan_size.m.height
        };

        // Building panel Mesh
        var panel = BABYLON.Mesh.CreateGround(
            "POI - Panel",
            pan_size.m.width,
            pan_size.m.height,
            2, scene
        );
        panel.id = id;
        panel.rotate (BABYLON.Axis.X, -Math.PI/2, BABYLON.Space.LOCAL);
        panel.position.x = position.x;
        panel.position.y = -1000;
        panel.position.z = position.z;
        panel.material = new BABYLON.StandardMaterial("POI - Panel - Material", scene);
        this.panel = panel;

        // Panel Texture
        var panel_tex = new BABYLON.DynamicTexture("POI - Panel - Texture", pan_size.px.width, scene, true);
        panel_tex.hasAlpha = true;
        fillPanelTexture();

        // Building pictogram Container
        var picto = BABYLON.Mesh.CreateGround(
            "POI - Panel",
            pan_size.m.width,
            pan_size.m.height,
            2, scene
        );
        picto.id = id;
        picto.material = new BABYLON.StandardMaterial("POI - Picto - Material", scene);
        picto.renderingGroupId = 1;
        this.picto = picto;
        picto.parent = panel;

        // Pictogram Texture
        var picto_tex = new BABYLON.DynamicTexture("POI - Picto - Texture", pan_size.px.width, scene, true);
        picto_tex.hasAlpha = true;
        fillPictoTexture();

        function fillPictoTexture () {
            var pictoContext = picto_tex.getContext();

            // Load the pictogram on the pictogram container
            var img = new Image();
            img.onload = function () {
                pictoContext.drawImage(img, 0, 0, picto_size.width, picto_size.height);

                // Update
                pictoContext.restore();
                picto_tex.update();
                picto.material.diffuseTexture = picto_tex;
                picto.material.emissiveTexture = picto_tex;
            };
            img.src = src;
        };

        function fillPanelTexture () {
            var panelContext = panel_tex.getContext();

            // Draws background of the pictogram on the panel
            panelContext.fillStyle = "rgba(255, 255, 255, 0.5)";
            RANDO.Utils.roundRect(panelContext, 0, 0, picto_size.width, picto_size.height, pan_size.px.width/10);

            // Set & draw the text on the panel
            var text = elevation + "m";
            var fontSize = (pan_size.px.height - picto_size.height) * RANDO.SETTINGS.POI_LABEL_SCALE ;
            panelContext.font = "bolder " + fontSize + "pt Arial";
            panelContext.fillStyle = "#fff";
            panelContext.textAlign = "center";
            panelContext.fillText(text, pan_size.px.width/2, pan_size.px.height);

            // Update
            panelContext.restore();
            panel_tex.update();
            panel.material.opacityTexture   = panel_tex;
            panel.material.emissiveTexture  = panel_tex;
        };
    };

    /**
     * RANDO.Poi._buildSphere() : build a Sphere which will be on the real position
     *  of the POI on the DEM.
     */
    RANDO.Poi.prototype._buildSphere = function () {
        var scene       = this._scene;
        var position    = this._position;

        var sphere = BABYLON.Mesh.CreateSphere(
            "POI - Sphere", 10, RANDO.SETTINGS.POI_SIZE, scene
        );
        sphere.material = new BABYLON.StandardMaterial(
            "POI - Sphere - Material", scene
        );
        sphere.material.diffuseColor = new BABYLON.Color3(1, 1, 1);
        sphere.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        this.sphere = sphere;
    };

    /**
     * RANDO.Poi._registerBeforeRender() : function to call before each scene render
     */
    RANDO.Poi.prototype._registerBeforeRender = function () {
        var scene       = this._scene;
        var panel       = this.panel;
        var picto       = this.picto;

        // Controls visibility according the Distance from camera
        if (BABYLON.Vector3.Distance(panel.position, scene.activeCamera.position) < 300) {
            panel.isVisible = false;
            picto.isVisible = false;
        }
        else {
            panel.isVisible = true;
            picto.isVisible = true;
        }

        // Controls panel orientation
        panel.lookAt(scene.activeCamera.position, 0, -Math.PI/2, 0);
    };

    /**
     * RANDO.Poi.drape() : drape the POI over the DEM
     *      - ground : ground of the DEM
     */
    RANDO.Poi.prototype.drape = function (ground) {
        RANDO.Utils.drapePoint(this.panel.position, ground, RANDO.SETTINGS.POI_OFFSET);
        this.sphere.position = this.panel.position.clone();
        this.sphere.position.y -= RANDO.SETTINGS.POI_OFFSET;
    };

    /**
     * RANDO.Poi.onMouseDownHandler() : callback to run if the mouse is down over a picto
     *      - evt: event informations
     */
    RANDO.Poi.prototype.onMouseDownHandler = function (evt) {
        $('.poi--clicked').text(this._name + ' (' + this._elevation + 'm )');
        $('.poi--clicked').css('left', evt.clientX - 20 + 'px');
        $('.poi--clicked').css('top',  evt.clientY - 40 + 'px');
        $('.poi--clicked').css('display', 'block');

        $('.poi_side h2').html(this._name );
        $('.poi_side .description').html(this._description);
        $('.poi_side').css('display', 'block');

        $('.interface').css('width', '80%');
    };

    /**
     * RANDO.Poi.onMouseOverHandler() : callback to run if the mouse is over a picto
     *      - evt: event informations
     */
    RANDO.Poi.prototype.onMouseOverHandler = function (evt) {
        $('.poi--hover').text(this._name + ' (' + this._elevation + 'm )');
        $('.poi--hover').css('left', evt.clientX - 20 + 'px');
        $('.poi--hover').css('top',  evt.clientY - 40 + 'px');
        $('.poi--hover').css('display', 'block');

        $('#canvas_renderer')[0].style.cursor = 'pointer';
    };

    /** Static
     * RANDO.Poi.runMouseListener() : Static function which run all mouse
     *  listeners linked to POIs, we give it a POI's array and it adds
     *  mouse events over all its elements.
     *
     *      - canvas : canvas where the scene is
     *      - pois : array of POIs
     *      - scene : scene
     */
    RANDO.Poi.runMouseListener = function (canvas, pois, scene) {
        var clickedID;

        // MouseDown Event : check if the mouse is over a Picto when Mouse left click is down
        RANDO.Events.addEvent(window, "mousedown", function (evt) {
            var pickResult = scene.pick (evt.clientX, evt.clientY);
            var pickedMesh = pickResult.pickedMesh;

            $('.poi--hover').css('display', 'none');
            $('.poi--clicked').css('display', 'none');
            clickedID = -1;

            // if the click hits a pictogram, we display informations of POI
            if (pickResult.hit && pickedMesh.name == "POI - Panel") {
                pois[pickedMesh.id].onMouseDownHandler(evt);
                clickedID = pickedMesh.id;
            }
        });

        // MouseMove Event : always check if mouse is over a Picto
        RANDO.Events.addEvent(window, "mousemove", function (evt) {
            var pickResult = scene.pick (evt.clientX, evt.clientY);
            var pickedMesh = pickResult.pickedMesh;

            $('.poi--hover').css('display', 'none');
            $('#canvas_renderer')[0].style.cursor = 'default';

            // if mouse is over a pictogram, we display informations of POI
            if (pickResult.hit && pickedMesh.name == "POI - Panel"
                && clickedID != pickedMesh.id) {
                pois[pickedMesh.id].onMouseOverHandler(evt);
            }
        });

        // Close button events of the POI side
        $(".close_btn").on('click', function () {
            $(".poi_side").css('display', 'none');
            $('.interface').css('width', '100%');
        });
        $(".close_btn").mouseover( function () {
           this.style.cursor = 'pointer';
        });
        $(".close_btn").mouseout( function () {
            this.style.cursor = 'default';
        });
    };

})();
