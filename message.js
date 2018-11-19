class Block {
    constructor(material, location) {
        this.material = material;
        this.location = location;
    }
}

// Incoming (server -> client) data types
class ChunkData {
    constructor(chunkID, blocks) {
        this.chunkID = chunkID;
        this.blocks = blocks;
    }

    getChunk() {
        return new Chunk(CHUNK_SIZE, this.chunkID, this.blocks);
    }

    getID() {
        return this.chunkID;
    }

    blockDiff(blockData) {
        if (this.chunk_id === blockData.chunk_id) {
            var block = blockData.block;
            this.blocks
                [(CHUNK_SIZE * CHUNK_SIZE * blockData.location[1])
                + (CHUNK_SIZE * blockData.location[2])
                + blockData.location[0]] = blockData.material; 
        }
    }
}

class BlockData {
    constructor(chunk_id, block) {
        this.chunk_id = chunk_id;
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
