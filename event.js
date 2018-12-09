var CURR_X;
var CURR_Y;

$(function() {

// Local testing
const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
const host = 'localhost:8080/ws';
var connection = new WebSocket(protocol + host);

// Remote server
// const host = "wss://gnocchi-graphics.herokuapp.com/ws";
// var connection = new WebSocket(host);
// console.log(connection);

connection.onopen = function() {
    console.log("Connected.");
};

connection.onmessage = function(m) {
    var data = JSON.parse(m.data);
    console.log("Received message: " + data.type);
    switch (data.type) {
        case "RegisterData":
            ID = data.id; 
            break;
        case "ChunkData":
            var chunk = new Chunk(data.size, data.index, data.blocks);
            CHUNKS.push(chunk);
            RELOAD = true;
            break;
        case "BlockData":
            var block = new Block(data.block.material, data.block.location);
            var blockData = new BlockData(data.index, block);
            CURRENT_CHUNK.blockDiff(blockData);
            break;
        case "EntityData":
            if (data.id === ID) {
                POSITION = data.position;
                VELOCITY = data.velocity;
                ACCELERATION = data.acceleration;
                console.log(POSITION);
            } else if (ENTITIES.has(data.id)) {
                const entity = ENTITIES.get(data.id);
                entity.position = data.position;
                entity.velocity = data.velocity;
                entity.acceleration = data.acceleration;
                ENTITIES.set(data.id, entity);
            } else {
                const entity = new Player(
                    data.id,
                    data.position,
                    data.velocity,
                    data.acceleration
                );
                ENTITIES.set(data.id, entity);
            }
            break;
    }
};

connection.onclose = function() {
    console.log("Disconnected.");
    connection = null;
};


var clientRect = webglCanvas.getBoundingClientRect();
const PREVMOUSE = [0.0, 0.0];
const CURRMOUSE = [0.0, 0.0];

/* Programmatically exit pointer lock (user can initiate exit by pressing 'Esc' key) */

// endPointerLock = function() {
//     document.exitPointerLock();
// }

//from ppa2
// const CANVAS = $("#webglCanvas");


// var MOUSEDOWN = false;

// /*
// * Normalized mouse coordinates (-1, 1)
// */
// function normalize(x, y) {
// const width = CANVAS.width() / 2;
// const height = CANVAS.height() / 2;
// return [(x - width) / width, (height  - y) / height];
// }

// /*
// *  Mouse move event updates current mouse position relative to WebGL canvas
// */

// $(window).mousemove(function(event) {
// console.log("mousemove");
// const curr = normalize(event.clientX - clientRect.left, event.clientY - clientRect.top);
// PREVMOUSE[0] = CURRMOUSE[0];
// PREVMOUSE[1] = CURRMOUSE[1];
// CURRMOUSE[0] = curr[0];
// CURRMOUSE[1] = curr[1];
// if (MOUSEDOWN) {
//     const currThetaPhi = toSpherical(toWorld(CURRMOUSE));
//     const prevThetaPhi = toSpherical(toWorld(PREVMOUSE));
//     const deltaTheta = currThetaPhi[0] - prevThetaPhi[0];
//     const deltaPhi = currThetaPhi[1] - prevThetaPhi[1];
//     console.log(deltaTheta);
//     rotate(-deltaTheta, -deltaPhi);
// }
// });

// CANVAS.mousedown(function(event) {
// console.log("mousedown");
// const curr = normalize(event.clientX - clientRect.left, event.clientY - clientRect.top);
// MOUSEDOWN = true;
// PREVMOUSE[0] = curr[0];
// PREVMOUSE[1] = curr[1];
// CURRMOUSE[0] = curr[0];
// CURRMOUSE[1] = curr[1];
// });

// $(window).mouseup(function(event) {
// console.log("mouseup");
// MOUSEDOWN = false;
// });

webglCanvas.onclick = function (event) { //TODO: differentiate between first onclick to start pointerlock vs clicking on blocks -- also show cursor for selecting blocks?
    webglCanvas.requestPointerLock();

}
webglCanvas.onmousedown = function(event) {
    PREVMOUSE[0] = event.clientX - clientRect.left;
    PREVMOUSE[1] = event.clientY - clientRect.top;
}

webglCanvas.onmousemove = function (event) {

    if(document.pointerLockElement) {
        CURRMOUSE[0] = PREVMOUSE[0] + event.movementX;
        CURRMOUSE[1] = PREVMOUSE[1] + event.movementY;
        const prevThetaPhi = toSpherical(toWorld(PREVMOUSE));
        const currThetaPhi = toSpherical(toWorld(CURRMOUSE));
        const deltaTheta = currThetaPhi[0] - prevThetaPhi[0];
        const deltaPhi = currThetaPhi[1] - prevThetaPhi[1];
        rotate(-2 * deltaTheta, -2 * deltaPhi);
        PREVMOUSE[0] = CURRMOUSE[0];
        PREVMOUSE[1] = CURRMOUSE[1];
    }

    //console.log("canvas mouse coords: (" + canvasX  + ", " + canvasY + ")");
    // dispatchEvent(new Event('load'));
}

window.onkeydown = function (event) {
    var direction = null;

    switch (event.which) {
    case 38: // Up
    case 87: // W
        event.preventDefault();
        direction = DIRECTION;
        break;
    case 65: // A
        event.preventDefault();
        var dirVec = vec3.create();
        var posVec = vec3.create();
        var rotVec = vec3.create();
        vec3.set(dirVec, DIRECTION[0], DIRECTION[1], DIRECTION[2]);
        vec3.set(posVec, 0, 0, 0);
        vec3.rotateY(rotVec, dirVec, posVec, Math.PI/2);
        vec3.normalize(rotVec, rotVec);
        direction = [rotVec[0], rotVec[1], rotVec[2]];
        break;
    case 40: // Down
    case 83: // S
        event.preventDefault();
        direction = [-DIRECTION[0], -DIRECTION[1], -DIRECTION[2]];
        
        break;
    case 68: // D
        event.preventDefault();
        var dirVec = vec3.create();
        var posVec = vec3.create();
        var rotVec = vec3.create();
        vec3.set(dirVec, DIRECTION[0], DIRECTION[1], DIRECTION[2]);
        vec3.set(posVec, 0, 0, 0);
        vec3.rotateY(rotVec, dirVec, posVec, 3 * Math.PI/2);
        vec3.normalize(rotVec, rotVec);
        direction = [rotVec[0], rotVec[1], rotVec[2]];
        break;
    case 9:  // Tab
    case 81: // Q
        event.preventDefault();
        direction = [0.0, 1.0, 0.0];
        break;
    case 16: // Shift
    case 69: // E 
        event.preventDefault();
        direction = [0.0, -1.0, 0.0];
        break;
    default:
        return;
    }

    const move = new MoveData(direction);
    connection.send(JSON.stringify(move));
};
});
