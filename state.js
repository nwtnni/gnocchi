var ID;
var ENTITIES = new Map();
var CHUNKS = [];
var RELOAD = false;
var POSITION = vec3.fromValues(0.0, 0.0, 0.0);
var THETA = 0.0;
var PHI = 0.0;

var CACHED_CHUNKS = 25;
var FOV = 80.0;
var SPEED = 0.25;
var SENSITIVITY = 0.005;

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function translate(direction) {
    vec3.add(POSITION, direction, POSITION);
}

function getProjMatrix() {
    var aspect = 800.0/600.0; //canvas width always 800 px wide, 600 px high
    var n = 0.1;
    var f = 100.0;
    var P = mat4.create();
    mat4.perspective(P, FOV, aspect, n, f);
    return P;
}

function getDirection() {
    var R = mat4.create();
    var R_x = mat4.create();
    var R_y = mat4.create();
    var dirVec = vec3.create();
    var forward = vec3.fromValues(0, 0, -1);
    var origin = vec3.fromValues(0, 0, 0);
    vec3.rotateZ(dirVec, forward, origin, Math.PI);
    vec3.rotateX(dirVec, dirVec, origin, -PHI);
    vec3.rotateY(dirVec, dirVec, origin, -THETA);
    vec3.normalize(dirVec, dirVec);
    return dirVec;
}

function getFrameMatrix() {
    var R = mat4.create();
    var R_x = mat4.create();
    var R_y = mat4.create();
    var R_z = mat4.create();
    var F = mat4.create();
    var T = mat4.create();
    var t = vec3.fromValues(-POSITION[0], -POSITION[1], -POSITION[2]);
    mat4.fromTranslation(T, t);
    mat4.fromZRotation(R_z, Math.PI);
    mat4.fromXRotation(R_x, PHI);
    mat4.fromYRotation(R_y, THETA);
    mat4.multiply(R, R, R_z);
    mat4.multiply(R, R, R_x);
    mat4.multiply(R, R, R_y);
    mat4.multiply(F, R, T);
    return F;
}

function rotate(dt, dp) {
    PHI += dp;
    PHI = clamp(PHI, -Math.PI / 2.0 + 0.05, Math.PI / 2.0 - 0.05);
    THETA += dt;
    THETA %= (Math.PI * 2.0);
}
