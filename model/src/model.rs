use std::collections::HashMap;

use data::*;
use generate::Generator;

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

    pub fn connect(&mut self, player: usize) {
        self.positions.insert(player, Position::default());
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
