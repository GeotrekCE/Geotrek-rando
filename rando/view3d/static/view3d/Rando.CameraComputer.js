/*******************************************************************************
 * Rando.CameraComputer.js
 *
 * CameraComputer class :
 *  Used to separate calculations from the CameraContainer
 *
 * @author: Célian GARCIA
 ******************************************************************************/

var RANDO = RANDO || {};

(function () {  "use strict"

    /* Constructor */
    RANDO.CameraComputer = function (center, extent, altitudes, offsets, scene, number) {
        this._center        = {
            'x' : center.x + offsets.x,
            'y' : center.y,
            'z' : center.z + offsets.z
        };
        this._totalExtent   = {
            'x' : {
                'min' : extent.x.min + offsets.x,
                'max' : extent.x.max + offsets.x
            },
            'y' : {
                'min' : extent.y.min,
                'max' : extent.y.max
            },
            'z' : {
                'min' : extent.z.min + offsets.z,
                'max' : extent.z.max + offsets.z
            }
        };
        this._scene = scene;
        this._altitudes = altitudes;
        this._squares   = [];
        this._alphaSquare = null;
        this._number = number || 5;
    };

    /* Methods */
    RANDO.CameraComputer.prototype.computeInitialPositionToRef = function (initialPosition) {
        this._generateSquares ();
        this._findAlphaSquare ();
        this._setPositionToRef (initialPosition);
        //~ this._buildSquareViewer();
    };

    RANDO.CameraComputer.prototype.computeInitialTargetToRef = function (initialTarget) {
        initialTarget.x = this._center.x;
        initialTarget.y = 0;
        initialTarget.z = this._center.z;
    };

    RANDO.CameraComputer.prototype.computeLimitsToRef = function (limits) {
        limits.lowerX = this._totalExtent.x.min;
        limits.upperX = this._totalExtent.x.max;
        limits.lowerZ = this._totalExtent.z.min;
        limits.upperZ = this._totalExtent.z.max;

        limits.lowerRadius = RANDO.SETTINGS.MIN_THICKNESS + this._center.y;
        limits.upperRadius = 8000;
    };


    RANDO.CameraComputer.prototype._generateSquares = function () {
        // Fill square's extents (needed to determine indices)
        var squareGrid = RANDO.Utils.createFlatGrid(
            {
                'x' : this._totalExtent.x.min,
                'y' : this._totalExtent.z.min
            },
            {
                'x' : this._totalExtent.x.max,
                'y' : this._totalExtent.z.min
            },
            {
                'x' : this._totalExtent.x.max,
                'y' : this._totalExtent.z.max
            },
            {
                'x' : this._totalExtent.x.min,
                'y' : this._totalExtent.z.max
            },
            this._number+1,
            this._number+1
        );
        this._fillExtents (squareGrid);

        // Fill square's types
        this._fillTypes ();

        // Fill square's indices
        var elevatedPoints = RANDO.Utils.createElevationGrid (
            this._totalExtent.x.min,
            this._totalExtent.x.max,
            this._totalExtent.z.min,
            this._totalExtent.z.max,
            this._altitudes
        );
        this._fillIndices (elevatedPoints);

        // Fill square's neighborhood
        this._fillNeighborhood ();
    };

    /**
     * RANDO.CameraComputer._fillExtents() : Fill the extent property of all squares
     *  - grid : a flat grid containing points of squares
     */
    RANDO.CameraComputer.prototype._fillExtents = function (grid) {
        for (var row = 0 ; row < grid.length-1 ; row++) {
            for (var col = 0 ; col < grid[row].length-1 ; col++) {
                this._squares.push ({
                    'extent' : {
                        'x' : {
                            'min' : grid[row][col].x,
                            'max' : grid[row+1][col+1].x
                        },
                        'z' : {
                            'min' : grid[row][col].y,
                            'max' : grid[row+1][col+1].y
                        }
                    }
                });
            }
        }
    };

    /**
     * RANDO.CameraComputer._fillTypes() : Fill the type property of all squares
     */
    RANDO.CameraComputer.prototype._fillTypes = function () {
        // CORNER types
        this._squares[0].type = "CORNER"; // left-down corner
        this._squares[this._number - 1].type = "CORNER"; // right-down corner
        this._squares[(this._number - 1) * this._number].type = "CORNER"; // left-up corner
        this._squares[(this._number * this._number) - 1].type = "CORNER"; // right-up corner

        // Extern BORDER types
        for (var i = 1; i < this._number - 1; i++) {
            this._squares[i].type = "EXTBORDER"; // down border
            this._squares[(this._number - 1) * this._number + i].type = "EXTBORDER"; // top border
            this._squares[this._number * i].type = "EXTBORDER"; // left border
            this._squares[this._number * i + this._number -1].type = "EXTBORDER";// right border
        }

        // Intern BORDER types
        for (var i = 1; i < this._number - 1; i++) {
            this._squares[i + this._number].type = "INTBORDER";// down internal border
            this._squares[i + this._number + (this._number-3) * this._number].type = "INTBORDER";
            this._squares[i * this._number + 1].type = "INTBORDER";
            this._squares[i * this._number + 1 + (this._number-3)].type = "INTBORDER";
        };

        // BLACK types
        for (var it in this._squares) {
            if (!this._squares[it].type) this._squares[it].type = "BLACK";
        }
    };

    /**
     * RANDO.CameraComputer._fillIndices() : Fill the index property of all squares
     *  - elevatedPoints : a two-array of all 3D points of the DEM
     *
     * NB : It needs to have already computed the extent and the type of each square
     */
    RANDO.CameraComputer.prototype._fillIndices = function (elevatedPoints) {
        // Increment indices of squares with elevated points which are inside
        for (var row = 0; row < elevatedPoints.length; row++) {
            for (var col = 0; col < elevatedPoints[row].length; col++) {
                var position = elevatedPoints[row][col];
                for (var it in this._squares) {
                    var square = this._squares[it];
                    if (square.type != "BLACK" && RANDO.Utils.isInExtent(position, square.extent)) {
                        if (square.index) {
                            square.index += position.y;
                            square.nb_alt++;
                        } else {
                            square.index = position.y;
                            square.nb_alt = 1;
                        }
                    }
                }
            }
        }

        // Create an index between 0 and 10 which represents the elevation's average of a square
        for (var it in this._squares) {
            var square = this._squares[it];
            square.index = square.index / square.nb_alt;
            square.index = square.index * 10 / (this._totalExtent.y.max  - this._totalExtent.y.min);
            if (square.type == "BLACK") {
                square.index = -1;
            }
        }
    };

    /**
     * RANDO.CameraComputer._fillNeighborhood() : Fill the neighborhood property of squares
     * which are of CORNER or EXTBORDER types
     *
     * ****************************************
     * The neighborhood contains all neighbours of a square following this schedule :
     *
     *          CORNER :
     *      |
     *      n
     *      n n
     *      s n n _
     *
     *          EXTBORDER :
     *      n n n
     *    _ n s n _
     *
     * With
     *  s = square we want to get its neighbours
     *  n = neighbours of the square
     *
     * ****************************************
     * NB : - The square will be counted in its neighborhood
     *      - It needs to have already computed the index of each square
     */
    RANDO.CameraComputer.prototype._fillNeighborhood = function () {
        var dx, dy, t_dx, t_dy = [-this._number, this._number];

        for (var curr = 0; curr < this._squares.length; curr++) {
            var square = this._squares[curr];

            if (square.type == "CORNER") {
                square.neighborhood = [];
                if (curr%this._number == 0) {
                    dx = 1;
                }
                else {
                    dx = -1;
                }
                if (this._squares[curr + this._number]) {
                    dy = this._number;
                }
                else {
                    dy = -this._number;
                }
                square.neighborhood.push(curr);
                square.neighborhood.push(curr + dx);
                square.neighborhood.push(curr + 2 * dx);
                square.neighborhood.push(curr + dy);
                square.neighborhood.push(curr + 2 * dy);
                square.neighborhood.push(curr + dx + dy);
            }
            else if (square.type == "EXTBORDER") {
                square.neighborhood = [];
                if (curr%this._number == 0) {
                    t_dx = [0, 1];
                }
                else if (curr%this._number == this._number -1) {
                    t_dx = [-1, 0];
                }
                else {
                    t_dx = [-1, 0, 1];
                }
                for (var i in t_dx) {
                    square.neighborhood.push (curr + t_dx[i]);
                    for (var j in t_dy) {
                        if (this._squares[curr + t_dy[j]]) {
                            square.neighborhood.push (curr + t_dx[i] + t_dy[j]);
                        }
                    }
                }
            }
            else {
                square.neighborhood = [];
            }
        }
    };

    /**
     * RANDO.CameraComputer._findAlphaSquare() : Find the Alpha Square
     *  The alpha square is the square which have the neighborhood with the lowest indices values
     */
    RANDO.CameraComputer.prototype._findAlphaSquare = function () {
        var that = this;
        this._alphaSquare = _.min(this._squares, function (square) {
            var result = 0;
            if (!square.neighborhood.length) {
                return Infinity;
            }
            for (var it in square.neighborhood) {
                result += that._squares[square.neighborhood[it]].index;
            }
            return result;
        });
    };

    /**
     * RANDO.CameraComputer._setPositionToRef() : set the position given in parameter
     *  according to the alpha square position
     *
     *  - result : reference to the position to change
     */
    RANDO.CameraComputer.prototype._setPositionToRef = function (result) {
        // Alpha position : elevation do not matter
        var A = new BABYLON.Vector3(
            (this._alphaSquare.extent.x.max + this._alphaSquare.extent.x.min) /2,
            0,
            (this._alphaSquare.extent.z.max + this._alphaSquare.extent.z.min) /2
        );

        // Center position
        var O = new BABYLON.Vector3(
            this._center.x,
            this._center.y,
            this._center.z
        );

        var scale = 2.5;
        var OC = A.subtract(O).scale(scale);

        // Camera position
        var C = OC.add(O);
        result.x = C.x;
        result.y = this._center.y + (this._totalExtent.y.max - this._totalExtent.y.min);
        result.z = C.z;
    };

    /**
     * RANDO.CameraComputer._buildSquareViewer() : build a viewer which materialize
     *  differents squares in spheres of color
     *
     *  CORNER squares are green
     *  Extern BORDER squares are blue
     *  Intern BORDER squares are orange
     *  Intern squares are black
     *  Alpha Square is red
     */
    RANDO.CameraComputer.prototype._buildSquareViewer = function () {
        for (var it in this._squares) {
            var sphere = BABYLON.Mesh.CreateSphere(
                "Square " + it,
                10, 100,
                this._scene
            );

            sphere.position.x = (this._squares[it].extent.x.min + this._squares[it].extent.x.max) /2;
            sphere.position.y = this._totalExtent.y.max;
            sphere.position.z = (this._squares[it].extent.z.min + this._squares[it].extent.z.max) /2;
            sphere.material = new BABYLON.StandardMaterial("Square " + it + " - Material", this._scene);
            if (this._alphaSquare == this._squares[it]) {
                sphere.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
            }
            else if (this._squares[it].type == "CORNER") {
                sphere.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
            }
            else if (this._squares[it].type == "EXTBORDER") {
                sphere.material.diffuseColor = new BABYLON.Color3(0, 1, 1);
            }
            else if (this._squares[it].type == "INTBORDER") {
                sphere.material.diffuseColor = new BABYLON.Color3(1, 0.5, 0);
            }
            else if (this._squares[it].type == "BLACK") {
                sphere.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            }
        }

        var sphere = BABYLON.Mesh.CreateSphere("Center", 10, 100, this._scene);
        sphere.position.x = this._center.x;
        sphere.position.y = this._totalExtent.y.max;
        sphere.position.z = this._center.z;
    };
})();
