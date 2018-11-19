use std::collections::HashMap;

use constants::CHUNK_SIZE;
use data::*;
use generate::Generator;

const AROUND: [(isize, isize); 9] = [
    (-1, -1), (0, -1), (1, -1),
    (0, -1), (0, 0), (0, 1),
    (1, -1), (1, 0), (1, 1),
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

    fn lazy_load(&mut self, index: Index) -> Option<Index> {
        if !self.chunks.contains_key(&index) {
            self.chunks.insert(index, self.generator.generate(index));
            Some(index)
        } else {
            None
        }
    }

    fn around(&self, position: Position) -> impl Iterator<Item = Index> {
        let scale = CHUNK_SIZE as f32;
        let x = (position.0.x / scale).floor() as isize;
        let z = (position.0.z / scale).floor() as isize;
        AROUND.iter().map(move |(dx, dz)| Index(x + dx, z + dz))
    }

    pub fn load_around(&mut self, position: Position) -> Vec<Index> {
        self.around(position)
            .inspect(|index| { self.lazy_load(*index); })
            .collect()
    }

    pub fn lazy_load_around(&mut self, position: Position) -> Vec<Index> {
        self.around(position)
            .filter_map(|index| self.lazy_load(index))
            .collect()
    }

    pub fn get_chunk(&mut self, index: Index) -> Chunk {
        self.chunks[&index].clone()
    }

    pub fn connect(&mut self, player: usize) -> Vec<Index> {
        let start = Position::default();
        self.positions.insert(player, start);
        self.load_around(start)
    }

    pub fn disconnect(&mut self, player: usize) {
        self.positions.remove(&player);
    }

    pub fn try_move(&mut self, player: usize, dir: Direction, magnitude: f32) -> Position {
        let previous = self.positions[&player];
        // TODO: collision checking here
        let next = previous.translate(dir, magnitude);
        self.positions.insert(player, next);
        next
    }
}
