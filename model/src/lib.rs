extern crate nalgebra_glm as glm;

mod constants;
mod data;
pub mod interact;
mod generate;
mod model;

pub use model::World;
pub use generate::Flat;
