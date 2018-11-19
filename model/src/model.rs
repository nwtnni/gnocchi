use std::collections::HashMap;

use constants::{CHUNK_SIZE, CHUNK_AREA, CHUNK_VOLUME};
use data::*;
use generate::Generator;

const AROUND: [(isize, isize); 9] = [
    (-1, -1), (0, -1), (1, -1),
    (-1, 0), (0, 0), (1, 0),
    (-1, 1), (0, 1), (1, 1),
];

#[derive(Default)]
pub struct World<G: Generator> {

    /// Lazily populated chunks
    chunks: HashMap<Index, Chunk>,

    /// Chunk generator
    generator: G,

    /// Player positions  
    positions: HashMap<usize, Position>,
}

impl <G: Generator> World<G> {

    fn lazy_load(&mut self, index: Index) -> Chunk {
        if !self.chunks.contains_key(&index) {
            self.chunks.insert(index, self.generator.generate(index));
        }
        self.chunks[&index].clone()
    }

    fn to_index(position: Position) -> Index {
        let scale = CHUNK_SIZE as f32;
        let x = (position.0.x / scale).floor() as isize;
        let y = (position.0.z / scale).floor() as isize;
        Index(x, y)
    }

    fn around(index: Index) -> impl Iterator<Item = Index> {
        AROUND.iter().map(move |(dx, dz)| Index(index.0 + dx, index.1 + dz))
    }

    fn load_around(&mut self, index: Index) -> Chunk {
        let chunks = Self::around(index)
            .map(|index| self.lazy_load(index))
            .collect::<Vec<_>>();

        // Merged chunk has coordinates of lower-left
        let index = Index(index.0 - 1, index.1 - 1);
        let mut blocks = vec![Block(Material::Air); CHUNK_VOLUME * 9];

        for cz in 0..3 {
            for cx in 0..3 {
                let chunk = &chunks[cz * 3 + cx];

                // Offset of chunk from lower-left
                let dz = cz * CHUNK_SIZE;
                let dx = cx * CHUNK_SIZE;

                for y in 0..CHUNK_SIZE {
                    for z in 0..CHUNK_SIZE {
                        for x in 0..CHUNK_SIZE {
                            let rel_index = x
                                + (CHUNK_SIZE * z)
                                + (CHUNK_AREA * y);
                            let abs_index = (x + dx)
                                + (CHUNK_SIZE * (z + dz)) 
                                + (CHUNK_AREA * y);
                            blocks[abs_index] = chunk.blocks[rel_index];
                        }
                    }
                }
            }
        }

        Chunk { index, blocks }
    }

    pub fn connect(&mut self, player: usize) -> Chunk {
        let start = Position::default();
        let index = Self::to_index(start);
        self.positions.insert(player, start);
        self.load_around(index)
    }

    pub fn disconnect(&mut self, player: usize) {
        self.positions.remove(&player);
    }

    pub fn try_move(
        &mut self,
        player: usize,
        direction: Direction,
        magnitude: f32
    ) -> (Position, Option<Chunk>) {
        // TODO: collision checking here
        let prev = self.positions[&player];
        let next = prev.translate(direction, magnitude);
        self.positions.insert(player, next);
        let prev_index = Self::to_index(prev);
        let next_index = Self::to_index(next);
        if prev_index != next_index {
            (next, Some(self.load_around(next_index)))
        } else {
            (next, None)
        }
    }
}
