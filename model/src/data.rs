use std::collections::HashMap as Map;

use glm;

use constants::CHUNK_SIZE;
use util;

const FACES: [Faces; 6] = [
    Faces::W, Faces::S, Faces::E, Faces::N, Faces::L, Faces::U,
];

bitflags! {
    #[derive(Serialize, Deserialize)]
    pub struct Faces: u8 {
        const W = 0b0000001;
        const S = 0b0000010;
        const E = 0b0000100;
        const N = 0b0001000;
        const L = 0b0010000;
        const U = 0b0100000;
    }
}

enum_number! (
    Material {
        Stone = 1,
        Grass = 2,
        Dirt = 3,
        Sand = 4,
        Snow = 5,
        Water = 6,
        Wood = 7,
        Leaf = 8,
    }
);

#[derive(Serialize, Deserialize)]
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct Block(pub Material);

impl Block {
    pub fn stone() -> Self { Block(Material::Stone) }
    pub fn grass() -> Self { Block(Material::Grass) }
    pub fn dirt() -> Self { Block(Material::Dirt) }
    pub fn sand() -> Self { Block(Material::Sand) }
    pub fn snow() -> Self { Block(Material::Snow) }
    pub fn water() -> Self { Block(Material::Water) }
    pub fn wood() -> Self { Block(Material::Wood) }
    pub fn leaf() -> Self { Block(Material::Leaf) }
}

#[derive(Serialize)]
#[derive(Clone, Debug)]
pub struct Mesh {
    pub index: Index,
    pub size: usize,
    #[serde(serialize_with = "util::serialize_chunk")]
    pub blocks: Map<Location, (Block, Faces)>,
}

impl <'a> From<&'a Chunk> for Mesh {
    fn from(chunk: &Chunk) -> Self {

        let mut blocks: Map<Location, (Block, Faces)> = Map::default();

        for (l1, b1) in &chunk.blocks {
            let mut faces = Faces::all();

            // Check for collisions with existing blocks
            for (l2, me, other) in l1.around() {
                if let Some(block) = blocks.get_mut(&l2) {
                    faces.remove(me);
                    block.1.remove(other);
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
    fn next(self, face: Faces) -> (Location, Faces, Faces) {
        match face {
        | Faces::W => (Location(self.0 - 1, self.1, self.2), Faces::W, Faces::E),
        | Faces::S => (Location(self.0, self.1, self.2 + 1), Faces::S, Faces::N),
        | Faces::E => (Location(self.0 + 1, self.1, self.2), Faces::E, Faces::W),
        | Faces::N => (Location(self.0, self.1, self.2 - 1), Faces::N, Faces::S),
        | Faces::L => (Location(self.0, self.1 - 1, self.2), Faces::L, Faces::U),
        | Faces::U => (Location(self.0, self.1 + 1, self.2), Faces::U, Faces::L),
        | _ => panic!("[INTERNAL ERROR]: non-valid face"),
        }
    }

    pub fn around(self) -> impl Iterator<Item = (Location, Faces, Faces)> {
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
    pub fn translate(self, Direction(dir): Direction) -> Self {
        Position(self.0 + dir)
    }
}
