use std::collections::HashMap as Map;

use constants::CHUNK_SIZE;
use data::{Block, Chunk, Index, Location};

pub trait Generator: Default {
    fn generate(&mut self, index: Index) -> Chunk;
}

#[derive(Copy, Clone, Default)]
pub struct Flat;

impl Generator for Flat {

    fn generate(&mut self, index: Index) -> Chunk {
        let grass = Block::grass();
        let stone = Block::stone();
        let mut chunk = Chunk { index, blocks: Map::default() };
        for z in 0..CHUNK_SIZE {
            for x in 0..CHUNK_SIZE {
                chunk.set(Location(x, 0, z), stone);
                chunk.set(Location(x, 1, z), grass);
            }
        }
        chunk
    }
}
