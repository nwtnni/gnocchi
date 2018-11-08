use std::cmp;
use std::f32;

use constants::EPSILON;

#[derive(Copy, Clone, Debug, PartialEq, Eq, Hash)]
pub enum Dir { N, S, E, W, U, D }

#[derive(Copy, Clone, Debug, Default, PartialEq, PartialOrd)]
pub struct Pos(f32, f32, f32);

impl Eq for Pos {}

impl Ord for Pos {
    fn cmp(&self, rhs: &Self) -> cmp::Ordering {
        fn compare<C>(a: f32, b: f32, otherwise: C) -> cmp::Ordering
            where C: Fn() -> cmp::Ordering
        {
            if f32::abs(a - b) < EPSILON {
                otherwise()
            } else if a < b {
                cmp::Ordering::Less
            } else {
                cmp::Ordering::Greater
            }
        }

        compare(self.0, rhs.0, || {
        compare(self.1, rhs.1, || {
        compare(self.2, rhs.2, || {
            cmp::Ordering::Equal
        })})})
    }
}

impl Pos {
    pub fn translate(self, dir: Dir, magnitude: f32) -> Self {
        match dir {
        | Dir::N => Pos(self.0, self.1, self.2 - magnitude),
        | Dir::S => Pos(self.0, self.1, self.2 + magnitude),
        | Dir::E => Pos(self.0 + magnitude, self.1, self.2),
        | Dir::W => Pos(self.0 - magnitude, self.1, self.2),
        | Dir::U => Pos(self.0, self.1 + magnitude, self.2),
        | Dir::D => Pos(self.0, self.1 - magnitude, self.2),
        }
    }
}
