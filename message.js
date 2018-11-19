class Block {
    constructor(material, location) {
        this.material = material;
        this.location = location;
    }
}

// Incoming (server -> client) data types
class ChunkData {
    constructor(chunk_id, blocks) {
        this.chunk_id = chunk_id;
        this.blocks = blocks;
    }
}

class BlockData {
    constructor(block) {
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
        this.direction = direction;
    }
}

class CreateData {
    constructor(block) {
        this.block = block;
    }
}

class RemoveData {
    constructor(block) {
        this.block = block;
    }
}