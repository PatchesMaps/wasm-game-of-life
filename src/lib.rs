mod utils;

use wasm_bindgen::prelude::*;
extern crate js_sys;
extern crate fixedbitset;
use fixedbitset::FixedBitSet;

// A macro to provide `println!(..)`-style syntax for `console.log` logging.
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub struct Universe {
    width: u32,
    height: u32,
    cells: FixedBitSet,
}

/// Public methods, exported to JavaScript.
#[wasm_bindgen]
impl Universe {
    /// Set the width of the universe.
    ///
    /// Resets all cells to the dead state.
    pub fn set_width(&mut self, width: u32) {
        self.width = width;
        let size = (width * self.height) as usize;
        self.cells = FixedBitSet::with_capacity(size);
    }

    /// Set the height of the universe.
    ///
    /// Resets all cells to the dead state.
    pub fn set_height(&mut self, height: u32) {
        self.height = height;
        let size = (self.width * height) as usize;
        self.cells = FixedBitSet::with_capacity(size);
    }

    pub fn width(&self) -> u32 {
        self.width
    }

    pub fn height(&self) -> u32 {
        self.height
    }

    pub fn toggle_cell(&mut self, row: u32, column: u32, live_only: bool) {
        let idx = self.get_index(row, column);
        let cell = self.cells[idx];
        self.cells.set(idx, cell != true || live_only);
    }

    pub fn spawn_spaceship(&mut self, row: u32, col: u32) {
        self.cells.set(self.get_index(row, col), true);
        self.cells.set(self.get_index(row + 1, col + 1), true);
        self.cells.set(self.get_index(row - 1, col + 2), true);
        self.cells.set(self.get_index(row, col + 2), true);
        self.cells.set(self.get_index(row + 1, col + 2), true);
    }

    fn get_index(&self, row: u32, column: u32) -> usize {
        (row * self.width + column) as usize
    }

    fn live_neighbor_count(&self, row: u32, column: u32) -> u8 {
        let mut count = 0;
        for delta_row in [self.height - 1, 0, 1].iter().cloned() {
            for delta_col in [self.width - 1, 0, 1].iter().cloned() {
                if delta_row == 0 && delta_col == 0 {
                    continue;
                }

                let neighbor_row = (row + delta_row) % self.height;
                let neighbor_col = (column + delta_col) % self.width;
                let idx = self.get_index(neighbor_row, neighbor_col);
                count += self.cells[idx] as u8;
            }
        }
        count
    }

    pub fn cells(&self) -> *const u32 {
        self.cells.as_slice().as_ptr()
    }

    pub fn tick(&mut self, forward: bool) {
        let mut next = self.cells.clone();

        for row in 0..self.height {
            for col in 0..self.width {
                let idx = self.get_index(row, col);
                let cell = self.cells[idx];
                let live_neighbors = self.live_neighbor_count(row, col);

                // log!(
                //     "cell[{}, {}] is initially {:?} and has {} live neighbors",
                //     row,
                //     col,
                //     cell,
                //     live_neighbors
                // );

                if forward == true {
                    next.set(idx, match (cell, live_neighbors) {
                        (true, x) if x < 2 => false,
                        (true, 2) | (true, 3) => true,
                        (true, x) if x > 3 => false,
                        (false, 3) => true,
                        (otherwise, _) => otherwise
                    });
                } else {
                    next.set(idx, match (cell, live_neighbors) {
                        (true, x) if x < 2 => true,
                        (true, 2) | (true, 3) => false,
                        (true, x) if x > 3 => true,
                        (false, 3) => false,
                        (otherwise, _) => otherwise
                    });
                }
            }
        }

        self.cells = next;
    }

    pub fn new(width: Option<u32>, height: Option<u32>) -> Universe {
        utils::set_panic_hook();
        let size = (width.unwrap_or(64) * height.unwrap_or(64)) as usize;
        let mut cells = FixedBitSet::with_capacity(size);

        for i in 0..size {
            // cells.set(i, i % 2 == 0 || i % 7 == 0);
            cells.set(i, js_sys::Math::random() < 0.5);
        }

        Universe {
            width: width.unwrap_or(64),
            height: height.unwrap_or(64),
            cells,
        }
    }
}

impl Universe {
    /// Get the dead and alive values of the entire universe.
    pub fn get_cells(&self) -> &FixedBitSet {
        &self.cells
    }

    /// Set cells to be alive in a universe by passing the row and column
    /// of each cell as an array.
    pub fn set_cells(&mut self, cells: &[(u32, u32)]) {
        for (row, col) in cells.iter().cloned() {
            let idx = self.get_index(row, col);
            self.cells.set(idx, true)
        }
    }
}
