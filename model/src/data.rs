use std::collections::{HashSet as Set, HashMap as Map};

use glm;

enum_number! (
    Face {
        W = 0,
        S = 1,
        E = 2,
        N = 3,
        L = 4,
        U = 5,
    }
);

impl Face {
    pub fn all() -> Set<Face> {
        let mut set = Set::with_capacity(6);
        set.insert(Face::W);
        set.insert(Face::S);
        set.insert(Face::E);
        set.insert(Face::N);
        set.insert(Face::L);
        set.insert(Face::U);
        set
    }
}

enum_number! (
    Material {
        Stone = 1,
        Grass = 2,
    }
);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Block(pub Material);

impl Block {
    pub fn stone() -> Self { Block(Material::Stone) }
    pub fn grass() -> Self { Block(Material::Grass) }
}

#[derive(Serialize)]
#[derive(Clone, Debug)]
pub struct Mesh {
    pub index: Index,
    pub blocks: Vec<(Location, Block, Set<Face>)>,
}

#[derive(Clone, Debug)]
pub struct Chunk {
    pub index: Index,
    pub blocks: Map<Location, Block>,
}

impl Chunk {
    pub fn get(&self, location: Location) -> Option<Block> {
        self.blocks.get(&location).cloned()
    }

    pub fn set(&mut self, location: Location, block: Block) {
        self.blocks.insert(location, block); 
    }
}

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Index(pub isize, pub isize);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Location(pub usize, pub usize, pub usize);

impl Location {
    pub fn facing(&self, rhs: &Self) -> Option<(Face, Face)> {
        let dx = rhs.0 as isize - self.0 as isize;
        let dy = rhs.1 as isize - self.1 as isize;
        let dz = rhs.2 as isize - self.2 as isize;
        match (dx, dy, dz) {
        | (-1,  0,  0) => Some((Face::W, Face::E)),
        | ( 1,  0,  0) => Some((Face::E, Face::W)),
        | ( 0, -1,  0) => Some((Face::L, Face::U)),
        | ( 0,  1,  0) => Some((Face::U, Face::L)),
        | ( 0,  0, -1) => Some((Face::N, Face::S)),
        | ( 0,  0,  1) => Some((Face::S, Face::N)),
        | _          => None,
        }
    }
}

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
