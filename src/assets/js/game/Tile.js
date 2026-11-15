import { signal } from 'rousejs';

export class Tile {
  #letter = signal('');
  #status = signal('');

  constructor(position) {
    this.position = position;
  }

  get letter() { return this.#letter(); }
  set letter(value) { this.#letter(value); }

  get status() { return this.#status(); }
  set status(value) { this.#status(value); }

  /**
   * Updates the letter and status of a row
   * @param {Number} row - The row index to evaluate
   * @param {String} theWord - The word to check against
   */ 
  static updateStatusesForRow(row, theWord) {
    theWord = theWord.split('');

    // check for correct letters
    for (const tile of row) {
      if (theWord[tile.position] === tile.letter) {
        tile.status = 'correct';
        theWord[tile.position] = null;
      }
    }

    // check for present letters
    for (const tile of row) {
      if (!tile.status && theWord.includes(tile.letter)) {
        tile.status = 'present';
        theWord[theWord.indexOf(tile.letter)] = null;
      }
    }

    // anything that remains is absent
    for (const tile of row.filter((tile) => !tile.status)) {
      tile.status = 'absent';
    }
  }

  fill(key) {
    this.letter = key.toLowerCase();
  }

  empty() {
    this.letter = '';
  }
}
