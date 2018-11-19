var CURR_X;
var CURR_Y;

$(function() {

    const protocol = window.location.protocol === 'https:' && 'wss://' || 'ws://';
    const host = 'localhost:8080/ws/';
    var connection = new WebSocket(protocol + host);
    console.log(connection);

    connection.onopen = function() {
        console.log("Connected.");
    };

    connection.onmessage = function(m) {
        var data = JSON.parse(m.data);
        console.log("Received message: " + data.type);
        switch (data.type) {
            case "ChunkData":
                var chunkData = new ChunkData(data);
                CURRENT_CHUNK = chunkData.getChunk();
                RELOAD = true;
                break;
            case "BlockData":
                var block = new Block(data.block.material, data.block.location);
                var blockData = new BlockData(data.index, block);
                CURRENT_CHUNK.blockDiff(blockData);
                break;
            case "EntityData":
                var entityData = new EntityData(data.id, data.position);
                POSITION = entityData.coordinate;
                console.log(POSITION);
                break;
        }
    };

    connection.onclose = function() {
        console.log("Disconnected.");
        connection = null;
    };

    webglCanvas.onmouseenter = function (event) {
        event.preventDefault();
        CURR_X = event.clientX;
        CURR_Y = event.clientY;
    }

    webglCanvas.onmousemove = function (event) {
        event.preventDefault();
        // event.clientX - CURR_X;
        console.log("hi");
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
