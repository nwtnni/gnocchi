use std::f32;

use glm;

#[derive(Copy, Clone, Debug)]
pub struct Dir(glm::Vec3);

impl Default for Dir {
    fn default() -> Self {
        Dir(glm::vec3(0.0, 0.0, 0.0))
    }
}

#[derive(Copy, Clone, Debug)]
pub struct Pos(glm::Vec3);

impl Default for Pos {
    fn default() -> Self {
        Pos(glm::vec3(0.0, 0.0, 0.0))
    }
}

impl Pos {
    pub fn translate(self, Dir(dir): Dir, magnitude: f32) -> Self {
        Pos(self.0 + dir * magnitude)
    }
}
