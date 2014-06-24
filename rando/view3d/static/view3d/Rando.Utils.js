// Rando.Utils.js 
// Rando utilities

var RANDO = RANDO || {};
RANDO.Utils = {};


/****    BABYLON extents     ************************/
/**
 *  createGroundFromExtent(): Create a ground from an extent of 4 points 
 *      - name : Name of the new Ground
 *      - A : northwest vertex
 *      - B : northeast vertex
 *      - C : southeast vertex
 *      - D : southwest vertex
 *      - w_subdivisions : Number of Width's subdivisions in the new Ground 
 *      - h_subdivisions : Number of Height's subdivisions in the new Ground
 *      - scene : Scene which contains the new Ground 
 *      - updatable : 
 * 
 ****************************************************************/
RANDO.Utils.createGroundFromExtent = function (name, A, B, C, D, w_subdivisions, h_subdivisions, scene, updatable) {
    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var grid = RANDO.Utils.createFlatGrid(A, B, C, D, w_subdivisions+ 1, h_subdivisions+ 1);
    for (row = 0; row <= h_subdivisions; row++) {
        for (col = 0; col <= w_subdivisions; col++) {
            var position = grid[row][col];
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            positions.push(position.x, 0, position.y);
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(col / w_subdivisions, 1.0 - row / h_subdivisions);
        }
    }

    for (row = 0; row < h_subdivisions; row++) {
        for (col = 0; col < w_subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + row * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));

            indices.push(col + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));
        }
    }
    
    ground.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
    ground.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
    ground.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
    ground.setIndices(indices);

    return ground;
};

/**
 *  createGroundFromGrid(): Create a ground from a grid of 2D points
 *      - name : Name of the new Ground
 *      - grid : grid of 2d points (each point contains a x and a y)
 *      - scene : Scene which contains the new Ground 
 *      - updatable : 
 * 
 ****************************************************************/
RANDO.Utils.createGroundFromGrid = function (name, grid, scene, updatable) {
    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var h_subdivisions = grid.length-1;
    var w_subdivisions = grid[0].length-1;
    
    for (row = 0; row <= h_subdivisions; row++) {
        w_subdivisions = grid[row].length-1;
        for (col = 0; col <= w_subdivisions; col++) {
            var position = grid[h_subdivisions - row][col];
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            positions.push(position.x, position.y, position.z);
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(col / w_subdivisions, 1.0 - row / h_subdivisions);
        }
    }

    for (row = 0; row < h_subdivisions; row++) {
        w_subdivisions = grid[row].length-1;
        for (col = 0; col < w_subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + row * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));

            indices.push(col + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));
        }
    }
    
    ground.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
    ground.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
    ground.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
    ground.setIndices(indices);

    return ground;
};

/**
 *  createGroundFromVertices(): Create a ground from an array of vertices
 *      - name : Name of the new Ground
 *      - vertices : Array of vertices in BABYLON.VertexBuffer.PositionKind format 
 *      - w_subdivisions : Number of Width's subdivisions in the new Ground 
 *      - h_subdivisions : Number of Height's subdivisions in the new Ground
 *      - scene : Scene which contains the new Ground 
 *      - updatable : 
 * 
 ****************************************************************/
RANDO.Utils.createGroundFromVertices = function( name, vertices, w_subdivisions, h_subdivisions, scene, updatable) {
    console.assert(vertices.length%3 == 0);
    console.assert((vertices.length/3) == w_subdivisions*h_subdivisions,
    (vertices.length/3) + "!=" + w_subdivisions + "*" + h_subdivisions);
    
    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var i = 0;
    for (row = 0; row <= h_subdivisions; row++) {
        for (col = 0; col <= w_subdivisions; col++) {
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            positions.push(vertices[i], vertices[i+1], vertices[i+2]);
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(col / w_subdivisions, 1.0 - row / h_subdivisions);
            i+=3;
        }
    }

    for (row = 0; row < h_subdivisions; row++) {
        for (col = 0; col < w_subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + row * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));

            indices.push(col + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));
        }
    }
    
    ground.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
    ground.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
    ground.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
    ground.setIndices(indices);

    return ground;
};

/**
 *  createSideFromLine(): Create a side of the DEM from a line of points (top line)
 *      - name : Name of the new Ground
 *      - line : Array of points [{x: ,y: ,z: }, ...]
 *      - base : Altitude of the base line
 *      - scene : Scene which contains the new side
 *      - updatable : 
 * 
 */
RANDO.Utils.createSideFromLine = function (name, line, base, scene, updatable) {
    var side = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var h_subdivisions = 1
    var w_subdivisions = line.length-1;
    
    // Positions, normals, and uvs
    for (row = 0; row <= h_subdivisions; row++) {
        for (col = 0; col <= w_subdivisions; col++) {
            var position = line[col];
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            if (row == 0) {
                positions.push(position.x, position.y, position.z);
            } else {
                positions.push(position.x, base, position.z);
            }
            
            normals.push(normal.x, normal.y, normal.z);
            uvs.push(col / w_subdivisions, 1.0 - row/1);
        }
    }

    // Indices
    for (row = 0; row < h_subdivisions; row++) {
        for (col = 0; col < w_subdivisions; col++) {
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + row * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));

            indices.push(col + (row + 1) * (w_subdivisions + 1));
            indices.push(col + 1 + (row + 1) * (w_subdivisions + 1));
            indices.push(col + row * (w_subdivisions + 1));
        }
    }
    
    side.setVerticesData(positions, BABYLON.VertexBuffer.PositionKind, updatable);
    side.setVerticesData(normals, BABYLON.VertexBuffer.NormalKind, updatable);
    side.setVerticesData(uvs, BABYLON.VertexBuffer.UVKind, updatable);
    side.setIndices(indices);

    return side;
}

/**
 *  placeCylinder()
 *      - cylinder (BABYLON.Mesh): BABYLON Cylinder object
 *      - A (BABYLON.Vector3):     First Point 
 *      - B (BABYLON.Vector3):     Second Point
 * 
 * Place the cylinder between both points  
 ****************************************************************/
RANDO.Utils.placeCylinder = function (cylinder, A, B) {
    // Initial position at the center of the AB vector
    cylinder.position = new BABYLON.Vector3(
        (A.x+B.x)/2,
        (A.y+B.y)/2,
        (A.z+B.z)/2
    );

    // Adjust scale of cylinder
    var new_height = BABYLON.Vector3.Distance(A, B);
    var scale_y  = (cylinder.scaling.y * new_height) / cylinder.height;
    cylinder.scaling.y = scale_y;
    
    // First rotation
    var angle1 = RANDO.Utils.angleFromAxis(A, B, BABYLON.Axis.X);
    cylinder.rotate(
        BABYLON.Axis.X, 
        angle1,
        BABYLON.Space.LOCAL
    );
    
    // Second rotation
    var H = new BABYLON.Vector3(A.x,B.y,B.z);
    var angle2 = RANDO.Utils.angleFromPoints(A, B, H);
    cylinder.rotate(
        BABYLON.Axis.Z, 
        angle2, 
        BABYLON.Space.LOCAL
    );
    
    return cylinder;
};

/**
 * ComputeMeshNormals() : recompute normals of a mesh (for the shadows after)
 *      - mesh: mesh to recompute
 */
RANDO.Utils.computeMeshNormals = function (mesh) {
    var vertices = BABYLON.VertexData.ExtractFromMesh (mesh);
    BABYLON.VertexData.ComputeNormals(vertices.positions, vertices.indices, vertices.normals);
    vertices.applyToMesh(mesh);
};

/**
 * setMeshUvs() : set the mesh uvs taking from the object uv taken in parameter
 *      mesh: babylon mesh 
 *      uvs: object js containing uvs values
 * 
 * NB: format of uv object parameter : 
 *      uv = {
 *          u: [],
 *          v: []
 *      }
 */
RANDO.Utils.setMeshUvs = function (mesh, uv) {
    var uv_array = [];
    for (row in uv.v) {
        for (col in uv.u) {
            uv_array.push(uv.u[col]);
            uv_array.push(uv.v[row]);
        }
    }

    console.assert(
        mesh.getVerticesData(BABYLON.VertexBuffer.UVKind).length == uv_array.length, 
        "setMeshUvs() : uvs in parameter are not well sized"
    );

    mesh.setVerticesData(uv_array, BABYLON.VertexBuffer.UVKind);
};

/**
 * RANDO.Utils.mergeMeshes() : Merge a mesh array in only one mesh. It permites 
 * to increase performance.
 *      - newMesh : future merged Mesh
 *      - arrayObj : array of Meshes to merge 
 * 
 * Function directly inspired from David Catuhe's one in the github wiki of BabylonJS
 * https://github.com/BabylonJS/Babylon.js/wiki/How-to-merge-meshes
 */
RANDO.Utils.mergeMeshes = function (newMesh, arrayObj) {
    var arrayPos = [];
    var arrayNormal = [];
    var arrayUv = [];
    var arrayUv2 = [];
    var arrayColor = [];
    var arrayMatricesIndices = [];
    var arrayMatricesWeights = [];
    var arrayIndice = [];
    var savedPosition = [];
    var savedNormal = [];
    var UVKind = true;
    var UV2Kind = true;
    var ColorKind = true;
    var MatricesIndicesKind = true;
    var MatricesWeightsKind = true;

    for (i = 0; i != arrayObj.length ; i++) {
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UVKind]))
            UVKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.UV2Kind]))
            UV2Kind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.ColorKind]))
            ColorKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesIndicesKind]))
            MatricesIndicesKind = false;
        if (!arrayObj[i].isVerticesDataPresent([BABYLON.VertexBuffer.MatricesWeightsKind]))
            MatricesWeightsKind = false;
    }

    for (i = 0; i != arrayObj.length ; i++) {
        var ite = 0;
        var iter = 0;
        arrayPos[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.PositionKind);
        arrayNormal[i] = arrayObj[i].getVerticesData(BABYLON.VertexBuffer.NormalKind);
        if (UVKind)
            arrayUv = arrayUv.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UVKind));
        if (UV2Kind)
            arrayUv2 = arrayUv2.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.UV2Kind));
        if (ColorKind)
            arrayColor = arrayColor.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.ColorKind));
        if (MatricesIndicesKind)
            arrayMatricesIndices = arrayMatricesIndices.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind));
        if (MatricesWeightsKind)
            arrayMatricesWeights = arrayMatricesWeights.concat(arrayObj[i].getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind));

        var maxValue = savedPosition.length / 3;

        arrayObj[i].computeWorldMatrix(true);
        var worldMatrix = arrayObj[i].getWorldMatrix();

        while (ite < arrayPos[i].length) {
            var vertex = new BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(arrayPos[i][ite], arrayPos[i][ite + 1], arrayPos[i][ite + 2]), worldMatrix);
            savedPosition.push(vertex.x);
            savedPosition.push(vertex.y);
            savedPosition.push(vertex.z);
            ite = ite + 3;
        }
        while (iter < arrayNormal[i].length) {
            var vertex = new BABYLON.Vector3.TransformNormal(new BABYLON.Vector3(arrayNormal[i][iter], arrayNormal[i][iter + 1], arrayNormal[i][iter + 2]), worldMatrix);
            savedNormal.push(vertex.x);
            savedNormal.push(vertex.y);
            savedNormal.push(vertex.z);
            iter = iter + 3;
        }
        if (i > 0) {
            var tmp = arrayObj[i].getIndices();
            for (it = 0 ; it != tmp.length; it++) {
                tmp[it] = tmp[it] + maxValue;
            }
            arrayIndice = arrayIndice.concat(tmp);
        }
        else {
            arrayIndice = arrayObj[i].getIndices();
        }

        arrayObj[i].dispose(false);
    }

    newMesh.setVerticesData(savedPosition, BABYLON.VertexBuffer.PositionKind, false);
    newMesh.setVerticesData(savedNormal, BABYLON.VertexBuffer.NormalKind, false);
    if (arrayUv.length > 0)
        newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.UVKind, false);
    if (arrayUv2.length > 0)
        newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.UV2Kind, false);
    if (arrayColor.length > 0)
        newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.ColorKind, false);
    if (arrayMatricesIndices.length > 0)
        newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.MatricesIndicesKind, false);
    if (arrayMatricesWeights.length > 0)
        newMesh.setVerticesData(arrayUv, BABYLON.VertexBuffer.MatricesWeightsKind, false);

    newMesh.setIndices(arrayIndice);
};

/**
 * RANDO.Utils.getSize () : get the size of a mesh
 *      - mesh : mesh 
 * 
 * return an object containing the width, height and deep of the mesh
 */
RANDO.Utils.getSize = function (mesh) {
    var minmax = BABYLON.Mesh.MinMax([mesh]);

    return {
        'width'  : (minmax.max.x - minmax.min.x) ,
        'height' : (minmax.max.y - minmax.min.y) ,
        'deep'   : (minmax.max.z - minmax.min.z)  
    };
}

RANDO.Utils.isInExtent = function (coordinates, extent) {
    if (coordinates.x > extent.x.min
     && coordinates.x < extent.x.max
     && coordinates.z > extent.z.min
     && coordinates.z < extent.z.max ) {
        return true;
    }
    return false;
};


/****    GEOMETRY     ************************/
/**tested
 * middle(): 
 *      A: first point
 *      B: second point
 * 
 * return the middle of the segment form by A and B
 */
RANDO.Utils.middle = function (A, B) {
    return {
        x: (A.x+B.x)/2,
        y: (A.y+B.y)/2,
        z: (A.z+B.z)/2
    };
};

/**tested
 * subdivide() :  interpolate a segment between 2 points A and B 
 *      - n : number of points expected in result
 *      - A : first point 
 *      - B : second point
 * 
 * return an array of point 
 * 
 * NB : points are in the format : { x : .. , y : .. } 
 * 
 * 
 * example :
 * 
 *         * B                   * B
 *        /                     /
 *       /      n = 4          * M2
 *      /      ---->          /
 *     /                     * M1
 *    /                     /
 * A *                    A* 
 * 
 *          result : [A, M1, M2, B]
 * 
 */
RANDO.Utils.subdivide = function (n, A, B) {
    
    if (n<=0) return null;
    
    if (n==1) return A;

    if (n==2) return [A,B];
    
    if (n>=3) {
        var dx = (B.x-A.x)/(n-1);
        var dy = (B.y-A.y)/(n-1);
        
        var x = A.x;
        var y = A.y;
        
        var res = [];
        res.push(A);
        for (var i=0; i<n-2; i++){
            x += dx;
            y += dy;
            res.push({
                'x' : x,
                'y' : y 
            });
        }
        res.push(B);
        return res;
    } 
}

/**tested
 * createGrid() : create a grid of points for all type of quadrilateres, in particular
 *  these which are not square or rectangle.
 *      - A, B, C, D :  vertices of quadrilatere to subdivide
 *      - n_verti :     number of points in vertical size
 *      - n_horiz :     number of points in horizontal size
 * 
 * 
 * NB : * n_verti and n_horiz cannot be invert
 *      * the order of input points is also important, it determines 
 * the order of output points : 
 *  [A, ...., B,    -> first line
 *   ..........,
 *   D, ...., C]    -> last line
 * 
 * 
 * Example of quadrilatere :
 * D *------------------* C
 *   |                   \
 *   |                    \
 *   |                     \
 *   |                      \
 *   |                       \
 *   |                        \
 * A *-------------------------* B
 * 
 */
RANDO.Utils.createFlatGrid = function (A, B, C, D, n_horiz, n_verti) {
    if(n_verti<=0) return null;
    if(n_horiz<=0) return null;

    // subdivide both sides of the quad
    var west_side = RANDO.Utils.subdivide(n_verti, A, D);
    var east_side = RANDO.Utils.subdivide(n_verti, B, C);
    var grid = [];
    console.assert(west_side.length == east_side.length, 
        "createGrid : west_side.length != east_side.length \n" +
        west_side.length + 
        " != " + 
        east_side.length 
    );
    
    
    for (var j=0; j < n_verti; j++){
        // subidivide lines
        var line = RANDO.Utils.subdivide(n_horiz, west_side[j], east_side[j]);
        grid.push(line);
    }
    return grid;
}

/**
 *
 * 
 */
RANDO.Utils.createElevationGrid = function (xmin, xmax, ymin, ymax, altitudes) {
    var A = {
        'x' : xmin,
        'y' : ymin
    };
    var B = {
        'x' : xmax,
        'y' : ymin
    };
    var C = {
        'x' : xmax,
        'y' : ymax
    };
    var D = {
        'x' : xmin,
        'y' : ymax
    };

    // Creates grid from extent datas
    var grid = RANDO.Utils.createFlatGrid(
        A, B, C, D,
        altitudes[0].length,
        altitudes.length
    );
    
    // Gives altitudes to the grid 
    for (row in altitudes){
        for (col in altitudes[row]){
            grid[row][col].z = grid[row][col].y;
            grid[row][col].y = altitudes[row][col];
        }
    }
    return grid;
};

/**tested
 * angleFromAxis(): get an angle for a rotation 
 *      - A     (BABYLON.Vector3) : First point 
 *      - B     (BABYLON.Vector3) : Second point
 *      - axis  (BABYLON.Vector3) : Axis of rotation
 * 
 * 
 * Example with a rotation around y axis 
 * 
 *                     _ z
 *       .->           | 
 *      /              |     * B
 *                     |    / 
 *                     |   /
 *                     |  /
 *                     | /
 *                     |/               x
 *       --------------*--------------->
 *                     |A 
 *                     | 
 *
 * NB : It uses global axis only 
 *  (1, 0, 0), (0, 1, 0), or (0, 0, 1)
 *
 */
RANDO.Utils.angleFromAxis = function (A, B, axis) {
    var angle, AH, AB;
    switch (axis){
        case BABYLON.Axis.X :
            if(A.y == B.y && A.z == B.z) // It don't need rotation around X
                return 0;
            AH = B.y-A.y;
            AB = Math.sqrt(
                Math.pow(B.y-A.y, 2)+
                Math.pow(B.z-A.z, 2)
            );
            angle = Math.acos(AH/AB);
            if (B.z < A.z)
                return -angle;
            return angle;
        break;
        case BABYLON.Axis.Y :
            if(A.x == B.x && A.z == B.z) // It don't need rotation around Y
                return 0;
            AH = B.z-A.z;
            AB = Math.sqrt(
                Math.pow(B.z-A.z, 2)+
                Math.pow(B.x-A.x, 2)
            );
            
            angle = Math.acos(AH/AB);
            //if (angle > Math.PI/2)
                //angle = -((Math.PI/2)-angle)
            if (B.x < A.x)
                return -angle;
            return angle;
        break;
        case BABYLON.Axis.Z :
            if(A.x == B.x && A.y == B.y) // It don't need rotation around Z
                    return 0;
            AH = B.x-A.x;
            AB = Math.sqrt(
                Math.pow(B.x-A.x, 2)+
                Math.pow(B.y-A.y, 2)
            );
            angle = Math.acos(AH/AB);
            if (B.y < A.y)
                return -angle;
            return angle;
    }
    return null;
}

/**
 * angleFromPoints() : get an angle from 3 points for a rotation around an axis 
 *  orthogonal of the plan formed by the 3 points 
 *      - A (BABYLON.Vector3) : First point
 *      - B (BABYLON.Vector3) : Second point
 *      - H (BABYLON.Vector3) : Orthogonal projection of B over the axis 
 * 
 * 
 * Example with a rotation around z axis 
 * 
 *                     _ x
 *       .->           | 
 *      /            H *     * B
 *                     |    / 
 *                     |   /
 *                     |  /
 *                     | /
 *                     |/               y
 *       --------------*--------------->
 *                     |A 
 *                     | 
 *
 * NB : It is used when we don't have especially classical global axis. For example
 * after a first rotation.
 * 
 */
RANDO.Utils.angleFromPoints = function (A, B, H) {
    var AH = BABYLON.Vector3.Distance(A, H);
    var AB = BABYLON.Vector3.Distance(A, B);
    var angle = Math.acos(AH/AB);
    
    // Check the sign 
    if (H.x < B.x) 
        return -angle;
    return angle;
};

RANDO.Utils.roundRect = function (context, x, y, w, h, radius) {
    var r = x + w;
    var b = y + h;
    context.beginPath();
    context.lineWidth="4";
    context.moveTo(x+radius, y);
    context.lineTo(r-radius, y);
    context.quadraticCurveTo(r, y, r, y+radius);
    context.lineTo(r, y+h-radius);
    context.quadraticCurveTo(r, b, r-radius, b);
    context.lineTo(x+radius, b);
    context.quadraticCurveTo(x, b, x, b-radius);
    context.lineTo(x, y+radius);
    context.quadraticCurveTo(x, y, x+radius, y);
    context.stroke();
    context.fill()
};

/**tested
 *  scaleArray2() : multiply all values of 2-dimensions array by a scale value
 *      - array2 : original array
 *      - scale : scale value
 * 
 * return a new array which contains all values of array2 multiplied
 */
RANDO.Utils.scaleArray2 = function (array2, scale) {
    var result = [];
    for (var row in array2) {
        var line = [];
        for (var col in array2[row]) {
            line.push(array2[row][col] * scale);
        }
        result.push(line);
    }
    return result;
};


/****    GETTERS     ************************/
/**tested
 * getUrlFromCoordinates(): get the url of a tile texture
 *      z : level of zoom
 *      x : x coordinates of tile
 *      y : y coordinates of tile
 *
 */
RANDO.Utils.replaceUrlCoordinates = function (url, z, x, y) {
    var subdomains = RANDO.SETTINGS.TILE_TEX_URL_SUBDOMAINS,
        index = Math.abs(x + y) % subdomains.length,
        subdomain = subdomains[index];

    url = url.replace("{s}", subdomain);
    url = url.replace("{z}", z);
    url = url.replace("{x}", x);
    url = url.replace("{y}", y);

    return url;
}

/**
 * getFrameFromTiles() : get borders of the DEM from the list of DEM tiles 
 *      - tiles: tiles of the DEM
 */
RANDO.Utils.getFrameFromTiles = function (tiles) {
    var frame = {};
    frame.east  = [];
    frame.west  = [];
    frame.north = [];
    frame.south = [];

    var extent = RANDO.Utils.getTileExtent(tiles);

    for (it in tiles) {
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

/**tested
 * getTileExtent() : get tile extent from the list of DEM tiles
 *      - tiles: tiles of the DEM
 */
RANDO.Utils.getTileExtent = function (tiles) {
    var tileExtent = {};
    tileExtent.x = {};
    tileExtent.y = {};
    
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


/****    CONVERSIONS     ************************/
/**tested
 * toMeters() : convert a point in latitude/longitude to x/y meters coordinates
 *      - latlng : point in lat/lng 
 * 
 * return a point in meters 
 * 
 * { lat : .. , lng : .. }  ---> { x : .. , y : .. }
 */
RANDO.Utils.toMeters = function (latlng) {

    var R = 6378137;

    var d = Math.PI / 180;
    var max = 1 - 1*Math.pow(10, -15);
    var sin = Math.max(Math.min(Math.sin(latlng.lat * d), max), -max);

    return {
        x : R * latlng.lng * d,
        y : R * Math.log((1 + sin) / (1 - sin)) / 2
    };
};

/**tested
 * toLatlng() : convert a point in x/y meters coordinates to latitude/longitude 
 *      - point : point in x/y meters coordinates
 * 
 * return a point in lat/long 
 * 
 * { x : .. , y : .. }  --->  { lat : .. , lng : .. }  
 */
RANDO.Utils.toLatlng = function (point) {
    
    var R = 6378137;
    
    var d = 180 / Math.PI;

    return {
        lat: (2 * Math.atan(Math.exp(point.y / R)) - (Math.PI / 2)) * d,
        lng: point.x * d / R
    };
}

/**
 * getMetersExtent() : get the extent of the DEM in meters
 *      - extent : extent of the DEM in latitudes/longitudes
 */
RANDO.Utils.getMetersExtent = function (extent) {
    var nw = RANDO.Utils.toMeters(extent.northwest);
    var ne = RANDO.Utils.toMeters(extent.northeast);
    var sw = RANDO.Utils.toMeters(extent.southwest);
    var se = RANDO.Utils.toMeters(extent.southeast);

    return {
        'x' : {
            'min' : Math.min(nw.x, sw.x),
            'max' : Math.min(ne.x, se.x)
        },
        'y' : extent.altitudes,
        'z' : {
            'min' : Math.min(sw.y, se.y),
            'max' : Math.min(nw.y, ne.y)
        },
    }
};

/**
 * meters2num(): get the tile number of the tile containing a point 
 *  in a certain level of zoom
 *      - x: x coordinate of point (in meters)
 *      - y: y coordinate of point (in meters)
 *      - zoom: zoom level
 */
RANDO.Utils.meters2num = function (x, y, zoom) {
    var tmp_ll = RANDO.Utils.toLatlng({
        'x': x,
        'y': y
    });
    return RANDO.Utils.deg2num(tmp_ll.lat, tmp_ll.lng, zoom);
};

/**
 * deg2num(): get the tile number of the tile containing a point 
 *  in a certain level of zoom
 *      - lat_deg: latitude  coordinate of point (in degrees)
 *      - lng_deg: longitude coordinate of point (in degrees)
 *      - zoom: zoom level
 */
RANDO.Utils.deg2num = function (lat_deg, lng_deg, zoom) {
    var lat_rad = lat_deg*Math.PI/180;
    var n = Math.pow(2.0, zoom);
    var xtile = Math.floor((lng_deg + 180.0) / 360.0 * n);
    var ytile = Math.floor((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return {
        "xtile": xtile, 
        "ytile": ytile
    };
};

/**
 * rad2num(): get the tile number of the tile containing a point 
 *  in a certain level of zoom
 *      - lat_rad: latitude  coordinate of point (in radians)
 *      - lng_rad: longitude coordinate of point (in radians)
 *      - zoom: zoom level
 */
RANDO.Utils.rad2num = function (lat_rad, lng_rad, zoom) {
    var lat_deg = lat_rad*180/Math.PI;
    var lng_deg = lng_rad*180/Math.PI;
    var n = Math.pow(2.0, zoom);
    var xtile = Math.floor((lng_deg + 180.0) / 360.0 * n);
    var ytile = Math.floor((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return {
        "xtile": xtile, 
        "ytile": ytile
    };
};


/****    TRANSLATIONS     ************************/
/**
 * drapePoint() : drape a point over the ground 
 *      - point: point to drape
 *      - dem: ground 
 */
RANDO.Utils.drapePoint = function (point, dem, offset) {
    if (typeof(offset) === "undefined") {
        var offset = 0;
    }
    var children = dem.getChildren();
    var ray =  new BABYLON.Ray(point, BABYLON.Axis.Y);
    for (it in children) {
        var pick = children[it].intersects(ray, true);
        if (pick.pickedPoint) {
            point.y = pick.pickedPoint.y + offset;
        }
    }
}
