const CHUNK_SIZE = 12;
var CURRENT_CHUNK;
var RELOAD = false;
var POSITION = [0.0, 0.0, 0.0];
var DIRECTION = [0.0, 0.0, -1.0];

function getProjMatrix() {
    var fov = 50.0;
    var aspect = 800.0/600.0; //canvas width always 800 px wide, 600 px high
    var n = 0.1;
    var f = 100.0;
    var P = mat4.create();
    mat4.perspective(P, fov, aspect, n, f);
    return P;
}

function getFrameMatrix() {
    var t = vec3.fromValues(-POSITION[0], POSITION[1], -POSITION[2]);
    var T = mat4.create();
    mat4.fromTranslation(T, t);
    return T;
}
