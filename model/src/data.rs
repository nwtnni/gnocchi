use std::collections::HashMap;

use constants::{CHUNK_SIZE, CHUNK_HEIGHT};

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum Material {
    Stone,
    Grass,
    Dirt,
    Air,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Block {
    material: Material,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Chunk {
    blocks: [[Block; CHUNK_SIZE]; CHUNK_HEIGHT],
}

#[derive(Debug)]
pub struct World {

    /// Lazily populated chunks
    chunks: HashMap<(isize, isize), Chunk>,

}
