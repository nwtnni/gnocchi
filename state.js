const CHUNK_SIZE = 6;
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
    var R = mat4.create();
    var F = mat4.create();
    var T = mat4.create();
    var t = vec3.fromValues(-POSITION[0], POSITION[1], POSITION[2]);
    var dirVec = vec3.fromValues(DIRECTION[0], DIRECTION[1], DIRECTION[2]);
    var origVec = vec3.fromValues(0, 0, -1);
    mat4.fromTranslation(T, t);
    var angle = vec3.angle(dirVec, origVec);
    mat4.fromRotation(R, angle, vec3.fromValues(0.0, 0.0, 0.0));

    mat4.multiply(F, R, T);
    return F;
}
