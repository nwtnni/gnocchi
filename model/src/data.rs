use std::collections::{HashSet as Set, HashMap as Map};

use glm;

use constants::CHUNK_SIZE;
use util;

const FACES: [Face; 6] = [
    Face::W, Face::S, Face::E, Face::N, Face::L, Face::U,
];

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
        FACES.iter().cloned().collect()
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
    pub size: usize,
    #[serde(serialize_with = "util::serialize_map_as_vec")]
    pub blocks: Map<Location, (Block, Set<Face>)>,
}

impl <'a> From<&'a Chunk> for Mesh {
    fn from(chunk: &Chunk) -> Self {

        let mut blocks: Map<Location, (Block, Set<Face>)> = Map::default();

        for (l1, b1) in &chunk.blocks {
            let mut faces = Face::all();

            // Check for collisions with existing blocks
            for (l2, me, other) in l1.around() {
                if let Some(block) = blocks.get_mut(&l2) {
                    faces.remove(&me);
                    block.1.remove(&other);
                }
            }

            // Insert new face
            blocks.insert(*l1, (*b1, faces));
        }

        blocks.retain(|_, (_, faces)| !faces.is_empty());
        Mesh {
            index: chunk.index,
            size: CHUNK_SIZE,
            blocks,
        }
    }
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
    fn next(self, face: Face) -> (Location, Face, Face) {
        match face {
        | Face::W => (Location(self.0 - 1, self.1, self.2), Face::W, Face::E),
        | Face::S => (Location(self.0, self.1, self.2 + 1), Face::S, Face::N),
        | Face::E => (Location(self.0 + 1, self.1, self.2), Face::E, Face::W),
        | Face::N => (Location(self.0, self.1, self.2 - 1), Face::N, Face::S),
        | Face::L => (Location(self.0, self.1 - 1, self.2), Face::L, Face::U),
        | Face::U => (Location(self.0, self.1 + 1, self.2), Face::U, Face::L),
        }
    }

    pub fn around(self) -> impl Iterator<Item = (Location, Face, Face)> {
        FACES.iter().map(move |face| self.next(*face)) 
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
