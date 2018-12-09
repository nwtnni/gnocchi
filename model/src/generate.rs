use std::collections::HashMap as Map;

use noise::{NoiseFn, Perlin};

use constants::CHUNK_SIZE;
use data::{Block, Chunk, Index, Location};

pub trait Generator: Default {
    fn generate(&mut self, index: Index) -> Chunk;
}

fn iter_chunk() -> impl Iterator<Item = (usize, usize)> {
    (0..CHUNK_SIZE).flat_map(|z| {
        (0..CHUNK_SIZE).map(move |x| (x, z))
    })
}

#[derive(Copy, Clone, Default)]
pub struct Flat;

impl Generator for Flat {

    fn generate(&mut self, index: Index) -> Chunk {
        let grass = Block::grass();
        let stone = Block::stone();
        let mut chunk = Chunk { index, blocks: Map::default() };
        for (x, z) in iter_chunk() {
            chunk.set(Location(x, 0, z), stone);
            chunk.set(Location(x, 1, z), grass);
        }
        chunk
    }
}

#[derive(Copy, Clone, Default)]
pub struct Debug;

impl Generator for Debug {
    fn generate(&mut self, index: Index) -> Chunk {
        let block = if index.0 == 0 && index.1 == 0 {
            Block::stone() 
        } else if index.0 == 0 && index.1 > 0 {
            Block::grass()
        } else if index.0 == 0 && index.1 < 0 {
            Block::dirt()
        } else if index.0 > 0 && index.1 == 0 {
            Block::sand()
        } else if index.0 < 0 && index.1 == 0 {
            Block::snow()
        } else {
            Block::water()
        };
        let mut chunk = Chunk { index, blocks: Map::default() };
        for (x, z) in iter_chunk() { chunk.set(Location(x, 0, z), block); }
        chunk
    }
}

#[derive(Clone, Debug, Default)]
pub struct Height {
    noise: Perlin, 
}

impl Generator for Height {
    fn generate(&mut self, index: Index) -> Chunk {
        let size = CHUNK_SIZE as f64;
        let height = 5.0;
        let dx = index.0 as f64 * size;
        let dz = index.1 as f64 * size;
        let grass = Block::grass();
        let stone = Block::stone();
        let mut chunk = Chunk { index, blocks: Map::default() }; 
        for z in 0..CHUNK_SIZE {
            for x in 0..CHUNK_SIZE {
                let xf = (x as f64 + dx) / (size * 2.0);
                let zf = (z as f64 + dz) / (size * 2.0);
                let height = (((self.noise.get([xf, zf]) / 2.0) + 1.0) * (height - 10.0)).floor() as usize;
                chunk.set(Location(x, 0, z), stone);
                for y in 1..(height + 1) { chunk.set(Location(x, y, z), grass); }
            }
        }
        chunk
    }
}
