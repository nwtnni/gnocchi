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

connection.onopen = function() {
    console.log("Connected.");
};

connection.onmessage = function(m) {
    var data = JSON.parse(m.data);
    switch (data.type) {
        case "RegisterData":
            ID = data.id; 
            break;
        case "ChunkData":
            var key = JSON.stringify(data.index);
            if (key in CHUNKS) break;
            var chunk = new Chunk(data.size, data.index, data.blocks);
            CHUNKS_NEW.push(key);
            CHUNKS[key] = chunk;
            break;
        case "BlockData":
            var block = new Block(data.block.material, data.block.location);
            var blockData = new BlockData(data.index, block);
            CURRENT_CHUNK.blockDiff(blockData);
            break;
        case "EntityData":
            if (data.id === ID) {
                vec3.set(POSITION, data.position[0], data.position[1], data.position[2]);
            } else {
                const entity = new Player(
                    data.id,
                    data.position
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
        rotate(event.movementX * getXAxis(), event.movementY * getYAxis());
    }
};

window.onkeydown = function (event) {
    var direction = vec3.create();

    switch (event.which) {
    case 38: // Up
    case 87: // W
        event.preventDefault();
        vec3.normalize(direction, getDirection());
        break;
    case 65: // A
        event.preventDefault();
        var origin = vec3.create();
        vec3.rotateY(direction, getDirection(), origin, Math.PI / 2.0);
        vec3.set(direction, direction[0], 0.0, direction[2]);
        vec3.normalize(direction, direction);
        break;
    case 40: // Down
    case 83: // S
        event.preventDefault();
        vec3.negate(direction, getDirection());
        vec3.normalize(direction, direction);
        break;
    case 68: // D
        event.preventDefault();
        origin = vec3.create();
        vec3.rotateY(direction, getDirection(), origin, -Math.PI / 2.0);
        vec3.set(direction, direction[0], 0.0, direction[2]);
        vec3.normalize(direction, direction);
        break;
    case 9:  // Tab
    case 81: // Q
        event.preventDefault();
        vec3.set(direction, 0.0, 1.0, 0.0);
        break;
    case 16: // Shift
    case 69: // E 
        event.preventDefault();
        vec3.set(direction, 0.0, -1.0, 0.0);
        break;
    default:
        return;
    }

    vec3.scale(direction, direction, getSpeed());
    translate(direction);
    const move = new MoveData(direction);
    connection.send(JSON.stringify(move));
};
});
