var ID;
var ENTITIES = new Map();
var CHUNKS = [];
var RELOAD = false;
var POSITION = [0.0, 0.0, 0.0];
var DIRECTION = [0.0, 0.0, -1.0]; 
var VELOCITY = [0.0, 0.0, 0.0];
var ACCELERATION = [0.0, 0.0, 0.0];
var theta = Math.PI;
var phi = Math.PI/2.0;

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

function getFrameMatrix() {
    var R = mat4.create();
    var R_x = mat4.create();
    var R_y = mat4.create();
    var F = mat4.create();
    var T = mat4.create();
    var t = vec3.fromValues(-POSITION[0], POSITION[1], POSITION[2]); //-x?

    mat4.fromTranslation(T, t);

    var pos = vec3.fromValues(POSITION[0], POSITION[1], POSITION[2]);
    //var dirVec = vec3.fromValues(DIRECTION[0], DIRECTION[1], DIRECTION[2]);
    //console.log(dirVec);
    var dirVec = vec3.create();
    var origVec = vec3.fromValues(0, 0, -1);
    //var angle = vec3.angle(dirVec, origVec);
    vec3.rotateX(dirVec, origVec, pos, phi);
    vec3.rotateY(dirVec, dirVec, pos, theta);
    //mat4.fromRotation(R, angle, vec3.fromValues(0.0, 0.0, 0.0));

    mat4.fromXRotation(R_x, phi);
    mat4.fromYRotation(R_y, theta);
    mat4.multiply(R, R_x, R_y);
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
    phi = clamp(phi + dp, min, max);
    theta += dt;
}



