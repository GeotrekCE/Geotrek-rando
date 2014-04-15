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
RANDO.Utils.createGroundFromExtent = function(name, A, B, C, D, w_subdivisions, h_subdivisions, scene, updatable) {
    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var grid = RANDO.Utils.createGrid(A, B, C, D, w_subdivisions+ 1, h_subdivisions+ 1);
    for (row = 0; row <= h_subdivisions; row++) {
        for (col = 0; col <= w_subdivisions; col++) {
            var position = grid[row][col];
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            positions.push(position.x, position.z, position.y);
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
RANDO.Utils.createGroundFromGrid = function(name, grid, scene, updatable) {
    var ground = new BABYLON.Mesh(name, scene);

    var indices = [];
    var positions = [];
    var normals = [];
    var uvs = [];
    var row, col;
    
    var h_subdivisions = grid.length-1;
    var w_subdivisions = grid[0].length-1;
    
    for (row = 0; row <= h_subdivisions; row++) {
        for (col = 0; col <= w_subdivisions; col++) {
            var position = grid[row][col];
            var normal = new BABYLON.Vector3(0, 1.0, 0);
            
            positions.push(position.x, position.z, position.y);
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
 *  createGroundFromVertices(): Create a ground from an array of vertices
 *      - name : Name of the new Ground
 *      - vertices : Array of vertices in BABYLON.VertexBuffer.PositionKind format 
 *      - w_subdivisions : Number of Width's subdivisions in the new Ground 
 *      - h_subdivisions : Number of Height's subdivisions in the new Ground
 *      - scene : Scene which contains the new Ground 
 *      - updatable : 
 * 
 ****************************************************************/
RANDO.Utils.createGroundFromVertices= function(name, vertices, w_subdivisions, h_subdivisions, scene, updatable) {
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
* processLargeArray(): Common utility to process large arrays
*
*       - array : large array
*       - callback : function that will be called with (array, index)
*/
RANDO.Utils.processLargeArray = function (array, callback) {
    // set this to whatever number of items you can process at once
    var chunk = 10;
    var index = 0;
    function doChunk() {
        var cnt = chunk;
        while (cnt-- && index < array.length-1) {
            callback(array, index);
            ++index;
        }
        if (index < array.length-1) {
            setTimeout(doChunk, 5);
        }
    }
    doChunk();
}

/**
 *  placeCylinder()
 *      - cylinder (BABYLON.Mesh): BABYLON Cylinder object
 *      - A (BABYLON.Vector3):     First Point 
 *      - B (BABYLON.Vector3):     Second Point
 * 
 * Place the cylinder between both points  
 ****************************************************************/
RANDO.Utils.placeCylinder = function(cylinder, A, B) {
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
}


/****    MATH     ************************/
/**
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
RANDO.Utils.subdivide = function(n, A, B){
    
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
                x : x,
                y : y 
            });
        }
        res.push(B);
        return res;
    } 
}

/**
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
 * A *------------------* B
 *   |                   \
 *   |                    \
 *   |                     \
 *   |                      \
 *   |                       \
 *   |                        \
 * D *-------------------------* C
 * 
 */
RANDO.Utils.createGrid = function(A, B, C, D, n_horiz, n_verti){
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
RANDO.Utils.angleFromAxis = function(A, B, axis){
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
RANDO.Utils.angleFromPoints = function (A, B, H){
    var AH = BABYLON.Vector3.Distance(A, H);
    var AB = BABYLON.Vector3.Distance(A, B);
    var angle = Math.acos(AH/AB);
    
    // Check the sign 
    if (H.x < B.x) 
        return -angle;
    return angle;
}

/**
 * Work in progress
 * 
 * 
 * 
 */
RANDO.Utils.subdivideGrid = function (grid, zoom){
    
    var sub_grid = {};
    
    var cnt = 0;
    var prev_index = null;
    for (row in grid) {
        for (col in grid[row]) {
            var tmp_ll = RANDO.Utils.toLatlng(grid[row][col]);

            var num_tile = rad2num(tmp_ll.lat, tmp_ll.lng, zoom);
            var index = "" + zoom + "/" + num_tile.xtile + "/" + num_tile.ytile + "";
            if (!sub_grid[index]){
                sub_grid[index] = {};
                sub_grid[index].vertices = [];
            }
            if (prev_index != null && prev_index != index) {
                sub_grid[prev_index].resolution = {};
                sub_grid[prev_index].resolution.x = cnt;
                cnt = 0;
            } 
            sub_grid[index].vertices.push(grid[row][col].x);
            sub_grid[index].vertices.push(grid[row][col].z);
            sub_grid[index].vertices.push(grid[row][col].y);
            
            prev_index = index;
            cnt++;
        }
        sub_grid[prev_index].resolution = {};
        sub_grid[prev_index].resolution.x = cnt;
        cnt = 0;
    }

    for (it in sub_grid) {
        sub_grid[it].resolution.y = (sub_grid[it].vertices.length/3)/sub_grid[it].resolution.x;
    }
    console.log(sub_grid);
    return sub_grid;
}

function deg2num(lat_deg, lng_deg, zoom){
    var lat_rad = lat_deg*Math.PI/180;
    var n = Math.pow(2.0, zoom);
    var xtile = Math.floor((lng_deg + 180.0) / 360.0 * n);
    var ytile = Math.floor((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return {
        "xtile": xtile, 
        "ytile": ytile
    };
}

function rad2num(lat_rad, lng_rad, zoom){
    var lat_deg = lat_rad*180/Math.PI;
    var lng_deg = lng_rad*180/Math.PI;
    var n = Math.pow(2.0, zoom);
    var xtile = Math.floor((lng_deg + 180.0) / 360.0 * n);
    var ytile = Math.floor((1.0 - Math.log(Math.tan(lat_rad) + (1 / Math.cos(lat_rad))) / Math.PI) / 2.0 * n);
    return {
        "xtile": xtile, 
        "ytile": ytile
    };
}


/****    CAMERA     ************************/
/**
 * moveCameraTo() : move a camera at the position given, and make it look at the 
 *  target given. 
 *      - camera    : camera 
 *      - position  : future position 
 *      - target    : future target
 *      - callback  : callback to call at the end of move
 * 
 */
RANDO.Utils.moveCameraTo = function(camera, position, target, callback){
    var rotation_y = RANDO.Utils.angleFromAxis(position, target, BABYLON.Axis.Y);
    
    // Translation
    TweenLite.to(camera.position, 2, { 
        x: position.x, 
        y: position.y + RANDO.SETTINGS.CAM_OFFSET,
        z: position.z,
        ease: 'ease-in',
        onComplete : function (){
            if (typeof(callback) == "function") callback();
        }
    });
    // Rotation
    TweenLite.to(camera.rotation, 2, { 
        x: 0,
        y: rotation_y, 
        z: 0,
        ease: 'ease-in',
        onComplete : function (){
            if (typeof(callback) == "function") callback();
        }
    });
}

/**
 * addKeyToCamera() : add a new position key and rotation key to the camera timeline
 *      - timeline: timeline of the camera (TimelineLite)
 *      - camera: camera 
 *      - position: position wanted for the camera
 *      - target: target wanted (necessary to determine the rotation to apply)
 *      - angles: array of all angles of rotation (it is filled in each instance of this function) 
 */
RANDO.Utils.addKeyToCamera = function(timeline, camera, position, target, angles){
    var speed = 2- (RANDO.SETTINGS.CAM_SPEED_T)+0.1;
    
    var alpha1,
        alpha2 = RANDO.Utils.angleFromAxis(position, target,BABYLON.Axis.Y);
    
    if(angles){
        alpha1 = angles[angles.length-2];
        if(alpha1*alpha2<0 && Math.abs(alpha1) > Math.PI/2 && Math.abs(alpha2) > Math.PI/2){
            alpha2 = (2*Math.PI - Math.abs(alpha2));
        }
    }
    
    timeline.add([
        TweenLite.to(camera.position, speed, {
            x: position.x, 
            y: position.y + RANDO.SETTINGS.CAM_OFFSET, 
            z: position.z, 
            ease: "Linear.easeNone"  
        }), 
        TweenLite.to(camera.rotation, speed, {
            y: alpha2,
            ease: "Power1.easeInOut"  
        })]
    );
    
    angles.push(alpha2);
}

/**
 *  animateCamera() : animation and controls of the camera 
 *      - vertices : array of vertices
 *      - scene : the current scene
 * 
 * */
RANDO.Utils.animateCamera = function(vertices, scene){
    var d = 10, // Number of points between the current point and the point watched
        b_foll = {"value": false},
        b_pause = true,
        timeline = new TimelineLite(),
        angles = [];

    // Filling of the timeline "tl_foll"
    for (var i=d; i< vertices.length-d; i+=d){
        RANDO.Utils.addKeyToCamera(timeline, scene.activeCamera, vertices[i], vertices[i+d], angles);
    }
    
    RANDO.Utils.addKeyToCamera(timeline, scene.activeCamera, vertices[i], vertices[vertices.length-1], angles);
    
    // Animation paused by default
    timeline.pause(0);
    
    // Controls
    var state = "flying";
    $(document).keyup(function(e){
        var keyCode = e.keyCode;

        // Space
        if (keyCode == 32){
            if (state == "start" || state == "pause") {
                state = "moving";
                timeline.play();
            }
            else if (state == "moving") {
                state = "pause";
                timeline.pause();
            }
        }

        // Enter
        if (keyCode == 13){
            if (state == "flying"){
                RANDO.Utils.moveCameraTo(scene.activeCamera, vertices[0], vertices[d], function(){
                    state = "start";
                });
            }
            else if ( state == "pause" || state == "moving" || state == "end" ){
                timeline.pause(0);
                state = "start";
            }
        }
    });
}

/**
 * refreshPanels() : refresh pivot matrices of all panels to always have panels 
 *  directed to the camera.
 *      - number (int)          : number of panels in the scene 
 *      - scene (BABYLON.Scene) : current scene
 */
RANDO.Utils.refreshPanels = function(number, scene){
    var A = scene.activeCamera.position;
    for (var i = 1; i < number; i++){
        var panel = scene.getMeshByName("Panel" +i);
        if (!panel) return null;
        var B = panel.position;
        var angle = RANDO.Utils.angleFromAxis(A, B, BABYLON.Axis.Y);
        var matrix = BABYLON.Matrix.RotationY(angle);
        panel.setPivotMatrix(matrix);
    }
    return 1;
}


/****    GETTERS     ************************/
/**
 * getVerticesFromProfile() : 
 *      - profile : troncon profile in json 
 * 
 * return an array of vertices 
 */
RANDO.Utils.getVerticesFromProfile = function(profile){
    var vertices =  [];
    
    for (it in profile){
        var tmp = {
            'lat' : profile[it][2][1],
            'lng' : profile[it][2][0]
        }
        tmp = RANDO.Utils.toMeters(tmp);
        tmp.z = tmp.y;
        tmp.y = profile[it][1]
        vertices.push(tmp);
    }
    
    return vertices;
}

/**
 * getExtent() : get the four corners of the DEM (in meters) and altitudes minimum and maximum
 *      - extent : extent of the DEM served by the json
 */
RANDO.Utils.getExtentinMeters = function(extent){
    return {
        northwest : RANDO.Utils.toMeters(extent.northwest),
        northeast : RANDO.Utils.toMeters(extent.northeast),
        southeast : RANDO.Utils.toMeters(extent.southeast),
        southwest : RANDO.Utils.toMeters(extent.southwest),
        altitudes : extent.altitudes
    }
}

/**
 * toMeters() : convert a point in latitude/longitude to x/y meters coordinates
 *      - latlng : point in lat/lng 
 * 
 * return a point in meters 
 * 
 * { lat : .. , lng : .. }  ---> { x : .. , y : .. }
 */
RANDO.Utils.toMeters = function(latlng) {
    
    var R = 6378137;

    var d = Math.PI / 180;
    var max = 1 - 1*Math.pow(10, -15);
    var sin = Math.max(Math.min(Math.sin(latlng.lat * d), max), -max);

    return {
        x : R * latlng.lng * d,
        y : R * Math.log((1 + sin) / (1 - sin)) / 2
    };
}

/**
 * toLatlng() : convert a point in x/y meters coordinates to latitude/longitude 
 *      - point : point in x/y meters coordinates
 * 
 * return a point in lat/long 
 * 
 * { x : .. , y : .. }  --->  { lat : .. , lng : .. }  
 */
RANDO.Utils.toLatlng = function(point) {
    
    var R = 6378137;
    
    var d = 180 / Math.PI;

    return {
        lat: (2 * Math.atan(Math.exp(point.y / R)) - (Math.PI / 2)) * d,
        lng: point.x * d / R
    };
}


/****    TRANSLATIONS     ************************/
/**
 * drapePoint() : drape a point over the ground 
 *      - point: point to drape
 *      - dem: ground 
 */
RANDO.Utils.drapePoint = function(point, dem){
    var ray =  new BABYLON.Ray(point, BABYLON.Axis.Y);
    var pick = dem.intersects(ray, true);
    if (pick.pickedPoint)
        point.y = pick.pickedPoint.y;
}

/**
 * translateDEM() : translate the DEM with coefficients given in parameters
 *      - dem : dem to translate 
 *      - dx  : x coefficient 
 *      - dy  : y coefficient  (altitudes in BABYLON)
 *      - dz  : z coefficient  (depth     in BABYLON)
 */
RANDO.Utils.translateDEM = function(dem, dx, dy, dz){
    for (row in dem.altitudes){
        for (col in dem.altitudes[row]){
            dem.altitudes[row][col] += dy;
        }
    }
    
    dem.center.x += dx;
    dem.center.y += dy;
    dem.center.z += dz;
    
    dem.extent.northwest.x += dx;
    dem.extent.northwest.y += dz;
    
    dem.extent.northeast.x += dx;
    dem.extent.northeast.y += dz;
    
    dem.extent.southeast.x += dx;
    dem.extent.southeast.y += dz;
    
    dem.extent.southwest.x += dx;
    dem.extent.southwest.y += dz;
    
    dem.extent.altitudes.min += dy;
    dem.extent.altitudes.max += dy;
}

/**
 * translateTrek() : translate a trek with coefficients given in parameters
 *      - vertices : vertices of the route 
 *      - dx  : x coefficient 
 *      - dy  : y coefficient  (altitudes in BABYLON)
 *      - dz  : z coefficient  (depth     in BABYLON)
 */
RANDO.Utils.translateTrek = function(vertices, dx, dy, dz){
    for (it in vertices){
        vertices[it].x += dx;
        vertices[it].y += dy;
        vertices[it].z += dz;
    }
}
















