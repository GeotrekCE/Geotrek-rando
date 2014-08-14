/*******************************************************************************
 * Rando.Dem.js
 *
 * Dem class :
 *  Permites the creation of a Digital Elevation Model in 3D
 *
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict"

    /* Constructor */
    RANDO.Dem = function (extent, altitudes, offsets, scene) {
        /* Attributes declaration */
        this._extent = this._prepareExtent(extent, offsets);
        this._altitudes = altitudes
        this._offsets = offsets;
        this._scene = scene;
        this._tiles = null;
        this._frame = null;
        this._textures = [];
        this._min_thickness = RANDO.SETTINGS.MIN_THICKNESS;

        this.ground = new BABYLON.Mesh("Digital Elevation Model", scene);
        this.sides  = new BABYLON.Mesh("Sides", scene);
        this.scaleViewer = null;

        /* Initialization */
        this.init();
    };

    /* Methods */
    RANDO.Dem.prototype.init = function () {
        this._adjustZoom ();

        var tileContainer = new RANDO.TileContainer(
            this.getRealExtent(),
            this._altitudes,
            this._offsets
        );
        this._tiles = tileContainer._tiles;
        this._frame = tileContainer.getFrame();

        this.buildGround();
        this.buildSides();
        this.buildBasement();
    };

    /*
     * RANDO.Dem._prepareExtent() : translate extent of the offsets in parameters
     *  - extent : extent to translate
     *  - offsets : values of the translation
     */
    RANDO.Dem.prototype._prepareExtent = function (extent, offsets) {
        extent.x.min += offsets.x;
        extent.x.max += offsets.x;
        extent.z.min += offsets.z;
        extent.z.max += offsets.z;
        return extent;
    };

    /*
     * RANDO.Dem._adjustZoom() : adjust the tile's zoom according the extent of the DEM
     *  More the DEM is large, more the zoom decreased and so tiles are bigger.
     *
     * NB : It take in count the RANDO.SETTINGS.TILE_NUMBER_LIMIT which correspond to the
     * limit number of tiles. This number can be changed in convenience before launch the scene.
     */
    RANDO.Dem.prototype._adjustZoom = function () {
        while (RANDO.Utils.getNumberOfTiles(RANDO.SETTINGS.TILE_ZOOM, this.getRealExtent()) > RANDO.SETTINGS.TILE_NUMBER_LIMIT) {
            RANDO.SETTINGS.TILE_ZOOM -= 1;
        }
    };

    /**
     * RANDO.Dem.buildGround() : build the ground of the DEM
     */
    RANDO.Dem.prototype.buildGround = function () {
        // Ground building...
        console.log("Ground building... " + (Date.now() - RANDO.START_TIME) );

        // Creates all tiles
        for (var it in this._tiles) {
            var meshTile = this._buildTile(this._tiles[it]);
            meshTile.parent = this.ground;

            // Prepare the future tile's texture
            this._prepareTexture(this._tiles[it].coordinates);
        }

        // Ground built !
        console.log("Ground built ! " + (Date.now() - RANDO.START_TIME) );
    };

    /**
     * RANDO.Dem.buildSides() : build four sides of the DEM
     */
    RANDO.Dem.prototype.buildSides = function () {
        // Sides building...
        console.log("Sides building... " + (Date.now() - RANDO.START_TIME) );

        var alt_min = - this._min_thickness;

        // Creates differents sides
        var e_side = this._buildSide("East Side",  this._frame.east,  alt_min, false);
        var w_side = this._buildSide("West Side",  this._frame.west,  alt_min, true );
        var n_side = this._buildSide("North Side", this._frame.north, alt_min, false);
        var s_side = this._buildSide("South Side", this._frame.south, alt_min, true );

        // Set sides container as parent of sides
        e_side.parent = this.sides;
        w_side.parent = this.sides;
        n_side.parent = this.sides;
        s_side.parent = this.sides;

        // Sides built !
        console.log("Sides built ! " + (Date.now() - RANDO.START_TIME) );
    };

    /**
     * RANDO.Dem.buildBasement() : build the basement of the DEM
     */
    RANDO.Dem.prototype.buildBasement = function () {
        // Basement building...
        console.log("Basement building... " + (Date.now() - RANDO.START_TIME) );

        var A = {
            'x' : this._extent.x.min,
            'y' : this._extent.z.min
        };
        var B = {
            'x' : this._extent.x.max,
            'y' : this._extent.z.min
        };
        var C = {
            'x' : this._extent.x.max,
            'y' : this._extent.z.max
        };
        var D = {
            'x' : this._extent.x.min,
            'y' : this._extent.z.max
        };
        var basement = RANDO.Utils.createGroundFromExtent (
            "DEM Basement", A, B, C, D, 1, 1, this._scene
        );
        basement.material = new BABYLON.StandardMaterial("Basement Material", this._scene);
        basement.material.diffuseTexture = new BABYLON.Texture(
            RANDO.SETTINGS.SIDE_TEX_URL,
            this._scene
        );
        basement.position.y -= this._min_thickness;

        // Basement built !
        console.log("Basement built ! " + (Date.now() - RANDO.START_TIME) );
    };

    /**
     * RANDO.Dem._buildTile() : build a tile of the DEM
     *      - data : data of a tile
     *
     *  return the tile mesh
     */
    RANDO.Dem.prototype._buildTile = function (data) {
        var scene   = this._scene;
        var engine  = scene.getEngine();
        var that    = this;

        // Creates Tile
        var tile = RANDO.Utils.createGroundFromGrid(
            "Tile",
            data.grid,
            scene
        );

        // Recomputes normals for lights and shadows
        RANDO.Utils.computeMeshNormals(tile)

        // Set Uvs data of the tile
        RANDO.Utils.setMeshUvs(tile, data.uv);

        // Enables collisions
        tile.checkCollisions = true;

        // Material
        var material = new BABYLON.StandardMaterial("DEM - Material", scene);
        material.wireframe = true;
        material.backFaceCulling = false;
        tile.material = material;
        return tile;
    };

    /**
     * RANDO.Dem._buildSide() : build a side of the DEM
     *      - name: name of the side
     *      - line: Array of point corresponding to a border of the DEM
     *      - alt_min: altitude minimale of the DEM
     *      - reverse: Boolean, if true reverse the line
     *
     *  return the side mesh
     */
    RANDO.Dem.prototype._buildSide = function (name, line, alt_min, reverse) {
        var scene = this._scene;

        if (reverse) {
            line.reverse();
        }

        // Creates side
        var side = RANDO.Utils.createSideFromLine(name, line, alt_min, scene);

        this._computeSideUvs(side, line, alt_min);

        // Side material
        side.material = new BABYLON.StandardMaterial(name + "Material", scene);
        side.material.diffuseTexture = new BABYLON.Texture(RANDO.SETTINGS.SIDE_TEX_URL, scene);

        // Recomputes normals for lights and shadows
        RANDO.Utils.computeMeshNormals(side);

        // Enables collisions
        side.checkCollisions = true;

        return side;
    };

    /**
     * RANDO.Dem.applyTextures() : Load tile's textures over the DEM
     */
    RANDO.Dem.prototype.applyTextures = function () {
        console.log("Textures application ... " + (Date.now() - RANDO.START_TIME) );

        //~ // Prepare all textures
        //~ for (var it in this._tiles) {
            //~ this._prepareTexture(this._tiles[it].coordinates);
        //~ }

        var scene = this._scene;
        var meshes = this.ground.getChildren ();
        var finalTextures = this._textures;
        var checked = [];
        var count = finalTextures.length;
        for (var it in finalTextures){
            checked.push(false);
        }

        loop();
        function loop (){
            var it = 0;
            var chunk = 50;
            apply();
            function apply () {
                var cnt = chunk;
                while (cnt-- && it < finalTextures.length) {
                    if (!checked[it] && finalTextures[it]._texture.isReady) {
                        checked[it] = true;

                        // Set the texture when it's loaded
                        var material = meshes[it].material;
                        material.diffuseTexture = finalTextures[it];
                        material.diffuseTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
                        material.diffuseTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
                        material.wireframe = false;
                        count--;
                    }
                    it++;
                }
                if (it < finalTextures.length) {
                    setTimeout (apply, 1);
                } else if (count > 0) {
                    setTimeout (loop, 1);
                } else {
                    console.log("Textures applied ! " + (Date.now() - RANDO.START_TIME) );
                }
            };
        }
    };

    /**
     * RANDO.Dem._prepareTexture() : Prepare a tile of textures for the DEM and add
     *  it to the textures Array.
     *      - coordinates : coordinates of a tile
     *
     */
    RANDO.Dem.prototype._prepareTexture = function (coordinates) {
        var scene = this._scene;
        var engine = scene.getEngine();
        var url = RANDO.Utils.replaceUrlCoordinates(
            RANDO.SETTINGS.TILE_TEX_URL,
            coordinates.z,
            coordinates.x,
            coordinates.y
        );
        this._textures.push(new BABYLON.Texture(url, scene));
    };

    /**
     * RANDO.Dem._computeSideUvs() : Computes uvs values of a side
     *      - side : side mesh
     *      - line : line of altitudes
     *      - alt_min : it is the minimum altitude of the DEM
     */
    RANDO.Dem.prototype._computeSideUvs = function (side, line, alt_min) {
        var cType = 'z';
        if (line[line.length-1].z - line[0].z == 0) {
            cType = 'x';
        }

        var u = [];
        for (var it in line) {
            u.push(
                Math.abs(line[it][cType] - line[0][cType]) *
                1 / (Math.abs(line[line.length-1][cType] - line[0][cType]))
            );
        }

        var uv = [];
        for (var it in u) {
            uv.push(u[it]); // u value
            uv.push((line[it].y - alt_min)/(this._extent.y.max - alt_min)); // v value
        }
        for (var it in u) {
            uv.push(u[it]); // u value
            uv.push(0); // v value
        }

        side.setVerticesData(BABYLON.VertexBuffer.UVKind, uv);
    };

    /**
     * RANDO.Dem.getRealExtent() : Give the real extent of the DEM, it means the
     *  extent in meters in the original projection.
     */
    RANDO.Dem.prototype.getRealExtent = function () {
        var extent = {};
        extent.x = {};
        extent.y = {};
        extent.z = {};
        extent.x.min = this._extent.x.min - this._offsets.x;
        extent.x.max = this._extent.x.max - this._offsets.x;
        extent.y.min = this._extent.y.min;
        extent.y.max = this._extent.y.max;
        extent.z.min = this._extent.z.min - this._offsets.z;
        extent.z.max = this._extent.z.max - this._offsets.z;
        return extent;
    };
})();
