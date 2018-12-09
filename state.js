var ID;
var ENTITIES = new Map();
var CHUNKS = [];
var RELOAD = false;
var POSITION = vec3.fromValues(0.0, 0.0, 0.0);
var VELOCITY = vec3.fromValues(0.0, 0.0, 0.0);
var ACCELERATION = vec3.fromValues(0.0, 0.0, 0.0);
var THETA = 0.0;
var PHI = Math.PI;

const SENSITIVITY = 0.005;

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

function getProjMatrix() {
    var fov = 80.0;
    var aspect = 800.0/600.0; //canvas width always 800 px wide, 600 px high
    var n = 0.1;
    var f = 100.0;
    var P = mat4.create();
    mat4.perspective(P, fov, aspect, n, f);
    return P;
}

function getDirection() {
    var R = mat4.create();
    var R_x = mat4.create();
    var R_y = mat4.create();

    var dirVec = vec3.create();
    var origVec = vec3.fromValues(0, 0, -1);

    vec3.rotateX(dirVec, origVec, POSITION, PHI);
    vec3.rotateY(dirVec, dirVec, POSITION, THETA);
    return dirVec;
}

function getFrameMatrix() {
    var R = mat4.create();
    var R_x = mat4.create();
    var R_y = mat4.create();
    var F = mat4.create();
    var T = mat4.create();
    var t = vec3.clone(POSITION);
    vec3.negate(t, t);
    mat4.fromTranslation(T, t);
    mat4.fromXRotation(R_x, PHI);
    mat4.fromYRotation(R_y, THETA);
    mat4.multiply(R, R_x, R_y);
    mat4.multiply(F, R, T);
    return F;
}

function rotate(dt, dp) {
    const min = -Math.PI / 2.0 + 0.05;
    const max = Math.PI / 2.0 - 0.05;
    PHI = clamp(PHI + dp, min, max);
    THETA += dt;
    THETA %= (Math.PI * 2.0);
}
