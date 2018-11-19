use model::data;

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug)]
pub struct Block {
    material: data::Material,
    location: data::Location,
}

#[derive(Message)]
#[derive(Serialize)]
#[derive(Clone, Debug)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum Outgoing {
    ChunkData(data::Mesh),

    BlockData {
        index: data::Index,
        block: Block,
    },

    EntityData {
        id: usize,
        position: data::Position,
    },
}

#[derive(Message)]
#[derive(Deserialize)]
#[derive(Clone, Debug)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum Incoming {
    CreateBlock {
        index: data::Index,   
        block: Block,
    },

    RemoveBlock {
        index: data::Index,   
        block: Block,
    },

    MoveData {
        direction: data::Direction,
    },
}
