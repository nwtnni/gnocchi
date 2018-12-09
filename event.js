var CURR_X;
var CURR_Y;

$(function() {

// Local testing
// const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
// const host = 'localhost:8080/ws';
// var connection = new WebSocket(protocol + host);

// Remote server
const host = "wss://gnocchi-graphics.herokuapp.com/ws";
var connection = new WebSocket(host);
console.log(connection);

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
                POSITION = vec3.fromValues(
                    data.position[0],
                    data.position[1],
                    data.position[2]
                );
                VELOCITY = vec3.fromValues(
                    data.velocity[0],
                    data.velocity[1],
                    data.velocity[2]
                );
                ACCELERATION = vec3.fromValues(
                    data.acceleration[0],
                    data.acceleration[1],
                    data.acceleration[2]
                );
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

webglCanvas.onclick = function (event) { 
    webglCanvas.requestPointerLock();
};

webglCanvas.onmousemove = function (event) {
    if (document.pointerLockElement) {
        rotate(event.movementX * SENSITIVITY, event.movementY * SENSITIVITY);
    }
};

window.onkeydown = function (event) {
    var direction = null;

    switch (event.which) {
    case 38: // Up
    case 87: // W
        event.preventDefault();
        direction = getDirection();
        vec3.normalize(direction, direction);
        direction = [direction[0], direction[1], direction[2]];
        break;
    case 65: // A
        event.preventDefault();
        var dirVec = getDirection();
        var posVec = vec3.create();
        var rotVec = vec3.create();
        vec3.set(posVec, 0, 0, 0);
        vec3.rotateY(rotVec, dirVec, posVec, Math.PI/2);
        vec3.normalize(rotVec, rotVec);
        direction = [rotVec[0], rotVec[1], rotVec[2]];
        break;
    case 40: // Down
    case 83: // S
        event.preventDefault();
        direction = getDirection();
        vec3.normalize(direction, direction);
        direction = [-direction[0], -direction[1], -direction[2]];
        break;
    case 68: // D
        event.preventDefault();
        var dirVec = getDirection();
        var posVec = vec3.create();
        var rotVec = vec3.create();
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
