/* tslint:disable */
/* eslint-disable */
/**
*/
export class Universe {
  free(): void;
/**
* Set the width of the universe.
*
* Resets all cells to the dead state.
* @param {number} width
*/
  set_width(width: number): void;
/**
* Set the height of the universe.
*
* Resets all cells to the dead state.
* @param {number} height
*/
  set_height(height: number): void;
/**
* @returns {number}
*/
  width(): number;
/**
* @returns {number}
*/
  height(): number;
/**
* @param {number} row
* @param {number} column
* @param {boolean} live_only
*/
  toggle_cell(row: number, column: number, live_only: boolean): void;
/**
* @param {number} row
* @param {number} col
*/
  spawn_spaceship(row: number, col: number): void;
/**
* @returns {number}
*/
  cells(): number;
/**
* @param {boolean} forward
*/
  tick(forward: boolean): void;
/**
* @param {number | undefined} width
* @param {number | undefined} height
* @returns {Universe}
*/
  static new(width?: number, height?: number): Universe;
}
