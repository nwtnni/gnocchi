class Block {
    constructor(material, location) {
        this.material = material;
        this.location = location;
    }
}

class BlockData {
    constructor(index, block) {
        this.index = index;
        this.block = block;
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
