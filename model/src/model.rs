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

    fn is_occupied(&mut self, position: Position) -> bool {
        let scale = CHUNK_SIZE as f32;
        let dx = (position.0.x / scale).floor() as isize;
        let dz = (position.0.z / scale).floor() as isize;
        let index = Index(dx, dz);
        let x = (position.0.x - (dx * CHUNK_SIZE as isize) as f32).round() as usize;
        let y = position.0.y.round() as usize;
        let z = (position.0.z - (dz * CHUNK_SIZE as isize) as f32).round() as usize;
        self.lazy_load(index);
        self.chunks[&index].blocks.contains_key(&Location(x, y, z)) 
    }

    pub fn get_position(&self, player: usize) -> Option<Position> {
        self.positions.get(&player).cloned()
    }

    pub fn connect(&mut self, player: usize) -> (Position, Vec<Mesh>) {
        let start = Position(glm::vec3(0.5, CHUNK_SIZE as f32, 0.5));
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

    pub fn try_move(
        &mut self,
        player: usize,
        direction: Direction,
        magnitude: f32
    ) -> (Position, Vec<Mesh>) {
        // TODO: collision checking here
        let prev = self.positions[&player];
        let next = prev.translate(direction, magnitude);

        if self.is_occupied(next) {
            return (prev, Vec::with_capacity(0))
        }

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
