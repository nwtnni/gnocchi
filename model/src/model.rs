use std::collections::HashMap as Map;

use glm;

use constants::CHUNK_SIZE;
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
    chunks: Map<Index, Chunk>,

    /// Chunk generator
    generator: G,

    /// Player positions
    positions: Map<usize, Position>,
}

impl <G: Generator> World<G> {

    fn to_index(position: Position) -> Index {
        let scale = CHUNK_SIZE as f32;
        let x = (position.0.x / scale).round() as isize;
        let y = (position.0.z / scale).round() as isize;
        Index(x, y)
    }

    fn around(position: Position) -> impl Iterator<Item = Index> {
        let index = Self::to_index(position);
        AROUND.iter().map(move |(dx, dz)| Index(index.0 + dx, index.1 + dz))
    }

    fn lazy_load(&mut self, index: Index) -> bool {
        if !self.chunks.contains_key(&index) {
            self.chunks.insert(index, self.generator.generate(index));
            true
        } else {
            false
        }
    }

    pub fn get_position(&self, player: usize) -> Option<Position> {
        self.positions.get(&player).cloned()
    }

    pub fn connect(&mut self, player: usize) -> (Position, Vec<Mesh>) {
        let start = Position(glm::vec3(0.5, 10.0, -0.5));
        self.positions.insert(player, start);
        let mut meshes = Vec::with_capacity(9);
        for index in Self::around(start) {
            self.lazy_load(index);
            meshes.push(Mesh::from(&self.chunks[&index]));
        }
        (start, meshes)
    }

    pub fn disconnect(&mut self, player: usize) {
        self.positions.remove(&player);
    }

    pub fn translate(&mut self, player: usize, direction: Direction) -> (Position, Vec<Mesh>) {

        let prev = self.positions[&player];
        let next = prev.translate(direction);
        self.positions.insert(player, next);

        let mut meshes = Vec::new();
        if Self::to_index(prev) != Self::to_index(next) {
            for index in Self::around(next) {
                self.lazy_load(index);
                meshes.push(Mesh::from(&self.chunks[&index]));
            }
        }

        (next, meshes)
    }
}
