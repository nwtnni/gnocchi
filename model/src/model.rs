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
        let x = (position.0.x / scale).floor() as isize;
        let y = (position.0.z / scale).floor() as isize;
        Index(x, y)
    }

    fn around(index: Index) -> impl Iterator<Item = Index> {
        AROUND.iter().map(move |(dx, dz)| Index(index.0 + dx, index.1 + dz))
    }

    fn lazy_load<'a>(&'a mut self, index: Index) -> bool {
        if !self.chunks.contains_key(&index) {
            self.chunks.insert(index, self.generator.generate(index));
            true
        } else {
            false
        }
    }

    pub fn connect(&mut self, player: usize) -> Vec<Mesh> {
        let start = Position(glm::vec3(0.0, 0.0, 0.0));
        let index = Self::to_index(start);
        self.positions.insert(player, start);
        let mut meshes = Vec::with_capacity(9);
        for index in Self::around(index) {
            self.lazy_load(index);
            meshes.push(Mesh::from(&self.chunks[&index]));
        }
        meshes
    }

    pub fn disconnect(&mut self, player: usize) {
        self.positions.remove(&player);
    }

    pub fn try_move(
        &mut self,
        player: usize,
        direction: Direction,
        magnitude: f32
    ) -> (Position, Vec<Mesh>) {
        // TODO: collision checking here
        let prev = self.positions[&player];
        let next = prev.translate(direction, magnitude);
        self.positions.insert(player, next);
        let index = Self::to_index(next);
        let mut meshes = Vec::new();
        for index in Self::around(index) {
            if self.lazy_load(index) {
                meshes.push(Mesh::from(&self.chunks[&index]));
            }
        }
        (next, meshes)
    }
}
