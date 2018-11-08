use std::collections::HashMap;

use data::*;
use interact::*;
use generate::Generator;

#[derive(Default)]
pub struct World<G: Generator> {

    /// Lazily populated chunks
    chunks: HashMap<Index, Chunk>,

    /// Chunk generator
    generator: G,

    /// Player positions  
    positions: HashMap<usize, Pos>,
}

impl <G: Generator> World<G> {

    pub fn connect(&mut self, player: usize) {
        self.positions.insert(player, Pos::default());
    }

    pub fn disconnect(&mut self, player: usize) {
        self.positions.remove(&player);
    }

    pub fn try_move(&mut self, player: usize, dir: Dir, magnitude: f32) {
        let previous = self.positions[&player];
        // TODO: collision checking here
        let next = previous.translate(dir, magnitude);
        self.positions.insert(player, next);
    }
}
