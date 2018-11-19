class Block {
    constructor(material, location) {
        this.material = material;
        this.location = location;
    }
}

// Incoming (server -> client) data types
class ChunkData {
    constructor(data) {
        this.index = data.index;
        this.blocks = data.blocks;
    }

    getChunk() {
        return new Chunk(CHUNK_SIZE, this.index, this.blocks);
    }

    getIndex() {
        return this.index;
    }

    // blockDiff(blockData) {
    //     if (this.index === blockData.index) {
    //         var block = blockData.block;
    //         this.blocks
    //             [(CHUNK_SIZE * CHUNK_SIZE * blockData.location[1])
    //             + (CHUNK_SIZE * blockData.location[2])
    //             + blockData.location[0]] = blockData.material; 
    //     }
    // }
}

class BlockData {
    constructor(index, block) {
        this.index = index;
        this.block = block;
    }
}

class EntityData {
    constructor(id, coordinate) {
        this.id = id;
        this.coordinate = coordinate;
    }
}

// Outgoing (client -> server) data types
class MoveData {
    constructor(direction) {
        this.type = "MoveData";
        this.direction = direction;
    }
}

class CreateBlock {
    constructor(block) {
        this.type = "CreateBlock";
        this.block = block;
    }
}

class RemoveBlock {
    constructor(block) {
        this.type = "RemoveBlock";
        this.block = block;
    }
}
