use std::collections::HashMap;

use constants::{CHUNK_SIZE, CHUNK_HEIGHT};
use generate::Generator;

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub enum Material {
    Stone,
    Grass,
    Dirt,
    Air,
}

#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Block {
    pub material: Material,
}

impl Block {
    pub fn air() -> Self { Block { material: Material::Air } }
    pub fn grass() -> Self { Block { material: Material::Grass } }
    pub fn stone() -> Self { Block { material: Material::Stone } }
}

#[derive(Clone)]
pub struct Chunk {
    pub blocks: [[Block; CHUNK_SIZE * CHUNK_SIZE]; CHUNK_HEIGHT],
}

#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Index(isize, isize);
