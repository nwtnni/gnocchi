/// Length and width of each chunk
pub const CHUNK_SIZE: usize = 32;

/// Area of a y-slice through each chunk
pub const CHUNK_AREA: usize = CHUNK_SIZE * CHUNK_SIZE;

/// Height of each chunk
pub const CHUNK_HEIGHT: usize = 32;

/// Epsilon for floating-point comparison
pub const EPSILON: f32 = 0.005;
