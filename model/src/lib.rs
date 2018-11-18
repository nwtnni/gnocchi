extern crate nalgebra_glm as glm;
extern crate serde;
#[macro_use]
extern crate serde_derive;

#[macro_use]
mod util;
mod constants;
pub mod data;
mod generate;
mod model;

pub use model::World;
pub use generate::Flat;
