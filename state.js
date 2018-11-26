const CHUNK_SIZE = 48;
var CURRENT_CHUNK;
var RELOAD = false;
var POSITION = [0.0, 0.0, 0.0];
var DIRECTION = [0.0, 0.0, -1.0];

function clamp(v, min, max) {
    return Math.min(Math.max(v, min), max);
}

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
    var t = vec3.fromValues(POSITION[0], POSITION[1], -POSITION[2]);
    var dirVec = vec3.fromValues(DIRECTION[0], DIRECTION[1], DIRECTION[2]);
    var origVec = vec3.fromValues(0, 0, -1);
    mat4.fromTranslation(T, t);
    var angle = vec3.angle(dirVec, origVec);
    mat4.fromRotation(R, angle, vec3.fromValues(0.0, 0.0, 0.0));

    mat4.multiply(F, R, T);
    return F;
}

 function toWorld(coord) {
        var fov = 60.0;
        var u = vec3.create();
        var v = vec3.create();
        var w = vec3.create();
        var s = Math.tan(Math.PI * fov / 360);
        vec3.set(u, 1.0, 0.0, 0.0);
        vec3.set(v, 0.0, 1.0, 0.0);
        vec3.set(w, 0.0, 0.0, 1.0);
        const negW = vec3.create();
        const scaledU = vec3.create();
        const scaledV = vec3.create();
        vec3.negate(negW, w);

        vec3.scale(scaledU, u, s * coord[0]);
        vec3.scale(scaledV, v, s * coord[1]);

        const mouseRay = vec3.create();
        vec3.set(mouseRay, 0, 0, 0);
        vec3.add(mouseRay, mouseRay, negW);
        vec3.add(mouseRay, mouseRay, scaledU);
        vec3.add(mouseRay, mouseRay, scaledV);
        vec3.normalize(mouseRay, mouseRay);
        return mouseRay;
}

/* Direction manipulation */
function toSpherical(ray) {
    const theta = Math.atan2(ray[0], ray[2]); // x over z
    const phi = Math.asin(-ray[1]);
    return [theta, phi];
}

function rotate(dt, dp) {
    const min = -Math.PI / 2.0 + 0.05;
    const max = Math.PI / 2.0 - 0.05;
    this.phi = clamp(this.phi + dp, min, max);
    this.theta += dt;
}



