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


    var clientRect = webglCanvas.getBoundingClientRect();
    const PREVMOUSE = [0.0, 0.0];
    const CURRMOUSE = [0.0, 0.0];

    /* Programmatically exit pointer lock (user can initiate exit by pressing 'Esc' key) */
    // endPointerLock = function() {
    //     document.exitPointerLock();
    // }

    webglCanvas.onclick = function (event) { //TODO: differentiate between first onclick to start pointerlock vs clicking on blocks -- also show cursor for selecting blocks?
        webglCanvas.requestPointerLock();

    }
    webglCanvas.onmousedown = function(event) {
        PREVMOUSE[0] = event.clientX - clientRect.left;
        PREVMOUSE[1] = event.clientY - clientRect.top;
    }

    webglCanvas.onmousemove = function (event) {
        // if(document.pointerLockElement) {
            
            CURRMOUSE[0] = PREVMOUSE[0] + event.movementX;//event.clientX - clientRect.left;
            CURRMOUSE[1] = PREVMOUSE[1] + event.movementY;//event.clientY - clientRect.top;
            const prevThetaPhi = toSpherical(toWorld(PREVMOUSE));
            const currThetaPhi = toSpherical(toWorld(CURRMOUSE));
            const deltaTheta = currThetaPhi[0] - prevThetaPhi[0];
            const deltaPhi = currThetaPhi[1] - prevThetaPhi[1];
            console.log(deltaTheta + " " + deltaPhi);
            rotate(-deltaTheta, -deltaPhi);
            PREVMOUSE[0] = CURRMOUSE[0];
            PREVMOUSE[1] = CURRMOUSE[1];
        //}

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
