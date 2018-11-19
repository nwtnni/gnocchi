use std::collections::{HashSet as Set, HashMap as Map};

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

    fn lazy_load(&mut self, index: Index) {
        if !self.chunks.contains_key(&index) {
            self.chunks.insert(index, self.generator.generate(index));
        }
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

    fn load_around(&mut self, index: Index) -> Mesh {
        for index in Self::around(index) {
            self.lazy_load(index);
        }

        let mut blocks: Map<Location, (Block, Set<Face>)> = Map::default();

        for (i, chunk) in Self::around(index).map(|index| &self.chunks[&index]).enumerate() {
            let dz = (i / 3) * CHUNK_SIZE;
            let dx = (i % 3) * CHUNK_SIZE;

            for (l, b1) in &chunk.blocks {
                let l1 = Location(l.0 + dx, l.1, l.2 + dz);
                let mut faces = Face::all();

                // Check for collisions with existing blocks
                for (l2, me, other) in l1.around() {
                    if let Some(block) = blocks.get_mut(&l2) {
                        faces.remove(&me);
                        block.1.remove(&other);
                    }
                }

                // Insert new face
                blocks.insert(l1, (*b1, faces));
            }
        }

        // Merged chunk has coordinates of lower-left
        let index = Index(index.0 - 1, index.1 - 1);
        blocks.retain(|_, (_, faces)| !faces.is_empty());
        Mesh {
            index,
            blocks: blocks.into_iter()
                .map(|(l, (m, f))| (l, m, f))
                .collect(),
        }
    }

    pub fn connect(&mut self, player: usize) -> Mesh {
        let start = Position(glm::vec3(0.0, 0.0, 0.0));
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
    ) -> (Position, Option<Mesh>) {
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
