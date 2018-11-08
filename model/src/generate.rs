use constants::{CHUNK_AREA, CHUNK_HEIGHT};
use data::{Block, Chunk, Index, Material};

pub trait Generator: Default {
    fn generate(&mut self, chunk: Index) -> Chunk;
}

#[derive(Copy, Clone, Default)]
pub struct Flat;

impl Generator for Flat {

    fn generate(&mut self, _: Index) -> Chunk {
        let air = Block::air();
        let grass = Block::grass();
        let stone = Block::stone();
        let mut blocks = [[air; CHUNK_AREA]; CHUNK_HEIGHT];
        for i in 0..CHUNK_AREA {
            blocks[0][i] = stone;
        }
        for i in 0..CHUNK_AREA {
            blocks[1][i] = grass;
        }
        Chunk { blocks }
    }
}
