use std::collections::HashMap as Map;

use noise::{NoiseFn, Perlin};

use constants::CHUNK_SIZE;
use data::{Block, Chunk, Index, Location};
use rand::Rng;

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
        for (x, z) in iter_chunk() {
            chunk.set(Location(x, 0, z), block);
            chunk.set(Location(x, 1, z), block);
        }
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
        let height = 15.0;
        let water_height = 10;
        let sand_height = 2;
        let dx = index.0 as f64 * size;
        let dz = index.1 as f64 * size;
        let grass = Block::grass();
        let water = Block::water();
        let sand = Block::sand();
        let wood = Block::wood();
        let leaf = Block::leaf();
        let mut chunk = Chunk { index, blocks: Map::default() }; 
        for z in 0..CHUNK_SIZE {
            for x in 0..CHUNK_SIZE {
                let xf = (x as f64 + dx) / (size * 2.0);
                let zf = (z as f64 + dz) / (size * 2.0);
                let height = (((self.noise.get([xf, zf]) / 2.0) + 1.0) * height).floor() as usize;
                chunk.set(Location(x, 10, z), water);
                for y in 1..(height + 1) { 
                    if y > water_height {
                        if y < water_height + sand_height {
                            chunk.set(Location(x, y, z), sand); 
                        } else {
                            chunk.set(Location(x, y, z), grass); 
                        }
                        if y == height && y > water_height + sand_height {
                            let mut rng = rand::thread_rng();
                            if rng.gen_range(0, 80) == 1 {
                                chunk.set(Location(x, y+1, z), wood);
                                chunk.set(Location(x, y+2, z), wood);
                                chunk.set(Location(x, y+3, z), wood);
                                chunk.set(Location(x+1, y+3, z+1), leaf);
                                chunk.set(Location(x+1, y+3, z), leaf);
                                chunk.set(Location(x+1, y+3, z-1), leaf);
                                chunk.set(Location(x-1, y+3, z-1), leaf);
                                chunk.set(Location(x-1, y+3, z), leaf);
                                chunk.set(Location(x-1, y+3, z+1), leaf);
                                chunk.set(Location(x, y+3, z-1), leaf);
                                chunk.set(Location(x, y+3, z), leaf);
                                chunk.set(Location(x, y+3, z+1), leaf);
                                chunk.set(Location(x, y+4, z), leaf);
                            }
                        }
                    }
                }
                
            }
        }
        chunk
    }
}
