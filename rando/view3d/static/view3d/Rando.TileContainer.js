/*******************************************************************************
 * Rando.TileContainer.js
 *
 * TileContainer class :
 *  Contains all data for the build of a tiled Digital Elevation Model
 *
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict"

    /* Constructor */
    RANDO.TileContainer = function (extent, altitudes, offsets) {
        /* Attributes declaration */
        this._extent = _.clone(extent);
        this._altitudes = _.clone(altitudes);
        this._offsets = _.clone(offsets);
        this._grid = null;
        this._tiles = {};

        this._init ();
    };

    /* Methods */
    RANDO.TileContainer.prototype._init = function () {
        this._generateTiles();
        this._joinTiles();
        this._computeSize();
        this._computeUvs();
        this.translate();
    };

    /**
     * RANDO.TileContainer._generateTiles() : generates an array of tiles which are js objects
     */
    RANDO.TileContainer.prototype._generateTiles = function () {
        var zoom = RANDO.SETTINGS.TILE_ZOOM;
        var tiles = this._tiles;

        this._grid = RANDO.Utils.createElevationGrid(
            this._extent.x.min,
            this._extent.x.max,
            this._extent.z.min,
            this._extent.z.max,
            this._altitudes
        );

        var grid = this._grid;

        var curr_index,  prev_index  = null,
            curr_point,  prev_point  = null,
            curr_tile_n, prev_tile_n = null,
            line_tmp = [],
            new_line = true;

        // Subdivide grid in tiles
        for (row in grid) {
            for (col in grid[row]) {
                curr_point = grid[row][col];

                // Get current tile number corresponding to the current point
                curr_tile_n = RANDO.Utils.meters2num( curr_point.x, curr_point.z, zoom );
                curr_index = "" + zoom + "/" + curr_tile_n.xtile + "/" + curr_tile_n.ytile + "";

                // tiles["z/x/y"] exists or not
                tiles[curr_index] = tiles[curr_index] || {};
                if (Object.keys(tiles[curr_index]).length == 0){
                    tiles[curr_index].grid = [];
                    tiles[curr_index].coordinates = {
                        z: zoom,
                        x: curr_tile_n.xtile,
                        y: curr_tile_n.ytile
                    };
                }
                // if the previous index exists and is different from the current index
                if ( prev_index != null && prev_index != curr_index ) {
                    tiles[prev_index].grid.push(line_tmp); // push the line into previous tile
                    line_tmp = []; // reset the line
                }

                line_tmp.push(_.clone(curr_point));

                prev_index = curr_index;
                prev_point = curr_point;
                new_line = false;
                prev_tile_n = curr_tile_n;
            }
            new_line = true;
        }

        // Push the last line of the last tile
        tiles[curr_index].grid.push(line_tmp);
    };

    /**
     * RANDO.TileContainer._joinTiles() : joins tiles data
     */
    RANDO.TileContainer.prototype._joinTiles = function () {
        var tiles = this._tiles;

        // Joins East and West sides of tiles
        for (var it in tiles) {
            var current_tile = tiles[it];
            var next_coord = {
                z: current_tile.coordinates.z,
                x: current_tile.coordinates.x + 1,
                y: current_tile.coordinates.y
            };
            var next_index = ""  + next_coord.z + "/" + next_coord.x + "/" + next_coord.y + "";

            // if next tile exist
            if (tiles[next_index]) {
                var current_grid = current_tile.grid;
                var next_grid = tiles[next_index].grid;

                // for each row in the current tile grid
                for (row in current_grid) {
                    var prev_point = current_grid[row][current_grid[row].length-1];
                    var next_point = next_grid[row][0];
                    var mid = RANDO.Utils.middle(prev_point, next_point);
                    current_grid[row].push(mid);
                    next_grid[row].splice(0, 0, _.clone(mid));
                }
            }
        }

        // Joins North and South sides of tiles
        for (it in tiles) {
            var current_tile = _.clone(tiles[it]);
            var next_coord = {
                z: current_tile.coordinates.z,
                x: current_tile.coordinates.x,
                y: current_tile.coordinates.y + 1
            };
            var next_index = ""  + next_coord.z + "/" + next_coord.x + "/" + next_coord.y + "";

            if (tiles[next_index]) {
                var next_tile = tiles[next_index];

                // First line of current tile
                var prev_line = _.clone(current_tile.grid[0]);

                // Last line of next tile
                var next_line = _.clone(next_tile.grid[next_tile.grid.length-1]);

                // we create a new line placed on the middle of the both previous
                // We need two variables to store this line
                var med_line1 = [];
                var med_line2 = [];

                for (var i in prev_line) {
                    var mid = RANDO.Utils.middle(prev_line[i], next_line[i]);
                    med_line1.push(_.clone(mid));
                    med_line2.push(_.clone(mid));
                }

                // The "median line" go to the south of current tile
                current_tile.grid.splice(0, 0, med_line1);
                // ... and to the north of next tile
                next_tile.grid.push(med_line2);
            }
        }
    };

    /**
     * RANDO.TileContainer._computeSize() : computes height and width of each tile and add it to the tiles data container
     */
    RANDO.TileContainer.prototype._computeSize = function () {
        var tiles = this._tiles;
        for (var it in tiles) {
            var tile = tiles[it];
            var grid = tile.grid;
            var n = grid.length-1;
            var m = grid[0].length-1;
            tile.size = {
                'width' : grid[0][m].x - grid[0][0].x,
                'height': grid[n][0].z - grid[0][0].z
            };
        }
    };

    /**
     * RANDO.TileContainer._computeUvs() :  computes uv values of each tile and add it to the tiles data container
     */
    RANDO.TileContainer.prototype._computeUvs = function () {
        var tiles = this._tiles;

        var max_width = _.max(tiles, function(tile) {
                return tile.size.width;
        }).size.width;

        var max_height = _.max(tiles, function(tile) {
                return tile.size.height;
        }).size.height;

        var extent = this.getExtentInTilesCoordinates();

        // Fill the uv data of tiles
        for (var it in tiles) {
            var tile = tiles[it];
            tile.uv = {};

            // Fill u array
            if (tile.coordinates.x == extent.x.min) { // East tiles
                tile.uv.u = uValues(tile, max_width, "east");
            }
            else if (tile.coordinates.x == extent.x.max) { // West tiles
                tile.uv.u = uValues(tile, max_width, "west");
            }
            else { // Interior tiles
                tile.uv.u = uValues(tile, tile.size.width, "normal");
            }

            // Fill v array
            if (tile.coordinates.y == extent.y.min) { // North tiles
                tile.uv.v = vValues(tile, max_height, "north");
            }
            else if (tile.coordinates.y == extent.y.max) { // South tiles
                tile.uv.v = vValues(tile, max_height, "south");
            }
            else { // Interior tiles
                tile.uv.v = vValues(tile, tile.size.height, "normal");
            }
        }

        function uValues(tile, width, string) {
            if (typeof (string) === 'undefined') string = "normal";
            console.assert(
                string == "east" || string == "normal" || string == "west",
                "uValues() function uncorrectly used"
            );

            if (string == "west") {
                string = "normal";
            }

            var n = tile.grid[0].length-1;
            switch (string) {
                case "east":
                    var u = [];
                    u[n] = 1;
                    for (var col = n-1; col >= 0; col--) {
                        var crt_x = tile.grid[0][col].x;
                        var nxt_x = tile.grid[0][col+1].x;
                        u[col] = u[col+1] - (Math.abs(nxt_x - crt_x)/width);
                    }
                    return u;
                break;
                case "normal":
                    var u = [];
                    u[0] = 0;
                    for (var col = 1; col <= n; col++) {
                        var crt_x = tile.grid[0][col].x;
                        var prv_x = tile.grid[0][col-1].x;
                        u[col] = u[col-1] + (Math.abs(prv_x - crt_x)/width);
                    }
                    return u;
                break;
                default:
                    return null;
            }
        };


        function vValues(tile, height, string) {
            if (typeof (string) === 'undefined') string = "normal";
            console.assert(
                string == "south" || string == "normal" || string == "north",
                "uValues() function uncorrectly used"
            );

            if (string == "north") {
                string = "normal";
            }

            var m = tile.grid.length-1;
            switch (string) {
                case "south":
                    var v = [];
                    v[m] = 1;
                    for (var row = m-1; row >= 0; row--) {
                        var crt_z = tile.grid[row][0].z;
                        var nxt_z = tile.grid[row+1][0].z;
                        v[row] = v[row+1] - (Math.abs(nxt_z - crt_z)/height);
                    }
                    v.reverse();
                    return v;
                break;
                case "normal":
                    var v = [];
                    v[0] = 0;
                    for (var row = 1; row <= m; row++) {
                        var crt_z = tile.grid[row][0].z;
                        var prv_z = tile.grid[row-1][0].z;
                        v[row] = v[row-1] + (Math.abs(prv_z - crt_z)/height);
                    }
                    v.reverse();
                    return v;
                break;
                default: return null;
            }
        };
    };

    /**
     * RANDO.TileContainer.translate() : translate the Tiles data of the offsets attribute or of
     * the offsets given in parameters
     */
    RANDO.TileContainer.prototype.translate = function (dx, dy, dz) {
        var tiles = this._tiles;
        var offsets = {};

        if (typeof(dx) === "undefined"){
            offsets.x = this._offsets.x;
        }else {
            offsets.x = dx;
        }

        if (typeof(dy) === "undefined"){
            offsets.y = this._offsets.y;
        }else {
            offsets.y = dy;
        }

        if (typeof(dz) === "undefined"){
            offsets.z = this._offsets.z;
        }else {
            offsets.z = dz;
        }

        // Translates the tiles positions of the offsets
        for (var it in tiles) {
            var grid = tiles[it].grid;
            for (row in grid) {
                for (col in grid[row]) {
                    grid[row][col].x += offsets.x;
                    grid[row][col].z += offsets.z;
                }
            }
        }
    };

    /**
     * RANDO.TileContainer.getFrame() : get the frame of the DEM composed by 4 lines
     *  east, west, north, and south.
     */
    RANDO.TileContainer.prototype.getFrame = function () {
        var frame = {};
        frame.east  = [];
        frame.west  = [];
        frame.north = [];
        frame.south = [];
        var tiles = this._tiles;

        var extent = this.getExtentInTilesCoordinates();

        for (var it in tiles) {
            var tile = tiles[it];
            if ( tile.coordinates.x == extent.x.max ) {
                var last_col = tile.grid[0].length -1;
                for (row in tile.grid) {
                    frame.east.push(tile.grid[row][last_col]);
                }
            }
            if ( tile.coordinates.x == extent.x.min ) {
                var first_col = 0;
                for (row in tile.grid) {
                    frame.west.push(tile.grid[row][first_col]);
                }
            }
            if ( tile.coordinates.y == extent.y.min ) {
                var last_row = tile.grid.length-1;
                for (col in tile.grid[last_row]){
                    frame.south.push(tile.grid[last_row][col]);
                }
            }
            if ( tile.coordinates.y == extent.y.max ) {
                var first_row = 0;
                for (col in tile.grid[first_row]){
                    frame.north.push(tile.grid[first_row][col]);
                }
            }
        }

        return frame;
    };

    /**
     * RANDO.TileContainer.getExtentInTilesCoordinates() : get the x and y extent in tile's
     * coordinates
     */
    RANDO.TileContainer.prototype.getExtentInTilesCoordinates = function () {
        var tileExtent = {};
        tileExtent.x = {};
        tileExtent.y = {};
        var tiles = this._tiles;

        // X extent
        tileExtent.x.min = _.min(tiles, function (tile) {
            return tile.coordinates.x;
        }).coordinates.x;

        tileExtent.x.max = _.max(tiles, function (tile) {
            return tile.coordinates.x;
        }).coordinates.x;

        // Y extent
        tileExtent.y.min = _.min(tiles, function (tile) {
            return tile.coordinates.y;
        }).coordinates.y;
        tileExtent.y.max = _.max(tiles, function (tile) {
            return tile.coordinates.y;
        }).coordinates.y;

        return tileExtent;
    };
})();
