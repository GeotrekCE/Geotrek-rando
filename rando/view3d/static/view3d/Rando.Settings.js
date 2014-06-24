// Rando.Settings.js 
// General settings  

var RANDO = RANDO || {};
RANDO.SETTINGS = {};

// Links
RANDO.SETTINGS.DEM_URL; // Url of the DEM json
RANDO.SETTINGS.PROFILE_URL; // Url of the trek's profile json
RANDO.SETTINGS.TILE_TEX_URL; // Url of a tile texture
RANDO.SETTINGS.SIDE_TEX_URL; // Url of the side texture
RANDO.SETTINGS.FAKE_TEX_URL; // Url of the fake texture
////////////////////////////////////////////////////////////////////////////////


// Camera 
RANDO.SETTINGS.CAM_OFFSET = 200; // Camera's altitude offset (in meters)

RANDO.SETTINGS.HCAM_FOLLOW_SPEED = 15; // HikerCamera speed when it follows trek
RANDO.SETTINGS.HCAM_RETURN_SPEED = 1500; // HikerCamera speed when it comes back to default
RANDO.SETTINGS.CAM_SPEED_F = 50;  // Camera speed in Flying mode(from 0 to infinity !) 
RANDO.SETTINGS.COLLISIONS_OFFSET = 150;
////////////////////////////////////////////////////////////////////////////////


// Geometry
RANDO.SETTINGS.ALTITUDES_Z_SCALE = 1.4;
RANDO.SETTINGS.LIMIT_VERT_BY_MESH = 65536;
RANDO.SETTINGS.TREK_SPH_TESSEL = 5;
RANDO.SETTINGS.TREK_CYL_TESSEL = 10;
RANDO.SETTINGS.MIN_THICKNESS = 200; // Minimum thickness of the DEM
RANDO.SETTINGS.TREK_OFFSET = 2; // Trek's altitude offset (in meters)

RANDO.SETTINGS.TREK_COLOR = new BABYLON.Color3(0.1,0.6,0.2); // Trek color (green)
                 // new BABYLON.Color3(0.1,0.6,0.2); // green 
                 // new BABYLON.Color3(0.8,0,0.2); // fuschia
                 // new BABYLON.Color3(0.9,0.5,0); // orange
                 
RANDO.SETTINGS.TREK_WIDTH = 10; // Trek width (in meters)

RANDO.SETTINGS.TILE_ZOOM = 17;

RANDO.SETTINGS.POI_OFFSET = 100;
RANDO.SETTINGS.POI_FORM1 = {
    objectName :    "" ,
    folder:         "blender/",
    fileName:       "poi.babylon"
};
RANDO.SETTINGS.POI_SIZE = 20;
RANDO.SETTINGS.POI_LABEL_SCALE = 1;
RANDO.SETTINGS.PICTO_SIZE = 100;
RANDO.SETTINGS.PICTO_PREFIX = "";

RANDO.SETTINGS.NO_DESCRIPTION_MESSAGE = "<p>Pas de description liée à ce point d'intérêt.</p>";
RANDO.SETTINGS.CAMERA_MESSAGES = {
    'bird_camera' : "On peut survoler le terrain tel un oiseau, tourner la tête, monter, descendre et se déplacer !",
    'examine_camera' : "On peut examiner le terrain en le tournant dans tous les sens.",
    'hiker_camera' : "Ici on est dans la peau d'un randonneur, on suit sans effort l'avancement de l'itinéraire, en profitant de la vue."
};

RANDO.SETTINGS.SCALE_VIEWER_SIZE = {
    'width' : 200,
    'height' : 200
};
RANDO.SETTINGS.SCALE_VIEWER_RESOLUTION = {
    'x' : 50,
    'y' : 50
};
RANDO.SETTINGS.SCALE_VIEWER_OFFSET = 20;
////////////////////////////////////////////////////////////////////////////////

RANDO.SETTINGS.parse = function (settings) {
    if ('test' in settings) {
    }
    
};

