/// Length and width of each chunk
pub const CHUNK_SIZE: usize = 4;

/// Area of a y-slice through each chunk
pub const CHUNK_AREA: usize = CHUNK_SIZE * CHUNK_SIZE;

/// Height of each chunk
pub const CHUNK_HEIGHT: usize = 4;

/// Volume of each chunk
pub const CHUNK_VOLUME: usize = CHUNK_AREA * CHUNK_HEIGHT;
