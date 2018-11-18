use model::data;

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug)]
pub struct Block {
    material: data::Material,
    location: data::Location,
}

#[derive(Message)]
#[derive(Serialize, Deserialize)]
#[derive(Clone, Debug)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum Outgoing {
    ChunkData {
        #[serde(rename = "chunkID")]
        index: data::Index,
        materials: Vec<data::Material>,
    },

    BlockData {
        #[serde(rename = "chunkID")]
        index: data::Index,
        block: Block,
    },

    EntityData {
        id: usize,
        position: data::Position,
    },
}

#[derive(Message)]
#[derive(Serialize, Deserialize)]
#[derive(Clone, Debug)]
#[serde(tag = "type", deny_unknown_fields)]
pub enum Incoming {
    CreateBlock {
        #[serde(rename = "chunkID")]
        index: data::Index,   
        block: Block,
    },

    RemoveBlock {
        #[serde(rename = "chunkID")]
        index: data::Index,   
        block: Block,
    },

    MoveData {
        direction: data::Direction,
    },
}
