use glm;

use constants::{CHUNK_SIZE, CHUNK_AREA};

enum_number! (
    Material {
        Air   = 0,
        Stone = 1,
        Grass = 2,
    }
);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Block(pub Material);

impl Block {
    pub fn air() -> Self { Block(Material::Air) }
    pub fn stone() -> Self { Block(Material::Stone) }
    pub fn grass() -> Self { Block(Material::Grass) }
}

#[derive(Clone, Debug)]
pub struct Chunk {
    pub index: Index,
    pub blocks: Vec<Block>,
}

impl Chunk {
    fn index(Location(x, y, z): Location) -> usize {
        x + CHUNK_SIZE * z + CHUNK_AREA * y
    }

    pub fn get(&self, location: Location) -> Block {
        self.blocks[Self::index(location)]
    }

    pub fn set(&mut self, location: Location, block: Block) {
        self.blocks[Self::index(location)] = block; 
    }
}

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Index(pub isize, pub isize);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Location(pub usize, pub usize, pub usize);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug)]
pub struct Direction(pub glm::Vec3);

impl Default for Direction {
    fn default() -> Self {
        Direction(glm::vec3(0.0, 0.0, 0.0))
    }
}

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug)]
pub struct Position(pub glm::Vec3);

impl Default for Position {
    fn default() -> Self {
        Position(glm::vec3(0.0, 0.0, 0.0))
    }
}

impl Position {
    pub fn translate(self, Direction(dir): Direction, magnitude: f32) -> Self {
        Position(self.0 + dir * magnitude)
    }
}
