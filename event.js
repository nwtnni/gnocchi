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
                var chunkData = new ChunkData(data.chunkID, data.materials);
                currChunk = chunkData.getChunk();
                reloadChunk = true;
                break;
            case "BlockData":
                var block = new Block(data.block.material, data.block.location);
                var blockData = new BlockData(data.chunkID, block);
                currChunk.blockDiff(blockData);
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

    window.onkeydown = function (event) {
        var direction = null;

        switch (event.which) {
        case 38: // Up
        case 87: // W
            event.preventDefault();
            direction = DIRECTION;
            break;
        case 40: // Down
        case 83: // S
            event.preventDefault();
            direction = [-DIRECTION[0], -DIRECTION[1], -DIRECTION[2]];
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
