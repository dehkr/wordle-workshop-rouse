import { computed, effect, reactive } from 'rousejs';
import { Tile } from './Tile';
import { allWords, theWords } from './words';

const MIN_GUESSES = 3;
const MAX_GUESSES = 10;
const STORAGE_KEY = 'wordle-game-state';
const STATUS_RANK = { absent: 1, present: 2, correct: 3 };
const validWords = new Set(allWords);
const letters = [
  'QWERTYUIOP'.split(''),
  'ASDFGHJKL'.split(''),
  ['Enter', ...'ZXCVBNM'.split(''), 'Backspace'],
];

function parseNumGuesses(raw) {
  if (raw !== undefined) {
    const num = Number(raw);
    if (Number.isInteger(num) && num >= MIN_GUESSES && num <= MAX_GUESSES) {
      return num;
    }
    console.warn(`Invalid data-guesses value: ${raw}. Must be an integer from ${MIN_GUESSES} to ${MAX_GUESSES}.`);
  }
  return MIN_GUESSES;
}

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
  } catch {
    return null;
  }
}

export const game = ({ host }) => {
  const board = reactive([]);
  const saved = loadSaved();
  const gameState = reactive({
    currentRowIndex: 0,
    errors: false,
    gameId: 0,
    guesses: [],
    message: '',
    numGuesses: parseNumGuesses(host.dataset.guesses),
    status: 'NONE', // NONE, IN_PROGRESS, WIN, LOSE
    ...saved,
  });

  effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // storage full or blocked; play continues unsaved 
    }
  });

  const theWord = () => theWords[gameState.gameId];
  const currentRow = () => board[gameState.currentRowIndex];
  const currentGuess = () => currentRow().map((tile) => tile.letter).join('');

  // Best status per letter. Reads letters only on scored tiles, so typing doesn't recompute it.
  const keyStatuses = computed(() => {
    const best = {};
    for (const tile of board.flat()) {
      const { status } = tile;
      if (!status) continue;
      if (STATUS_RANK[status] > (STATUS_RANK[best[tile.letter]] ?? 0)) {
        best[tile.letter] = status;
      }
    }
    return best;
  });

  function clearError() {
    gameState.errors = false;
    gameState.message = '';
  }

  function newGame() {
    gameState.currentRowIndex = 0;
    gameState.errors = false;
    gameState.gameId = Math.floor(Math.random() * theWords.length);
    gameState.guesses = [];
    gameState.message = '';
    gameState.numGuesses = parseNumGuesses(host.dataset.guesses);
    gameState.status = 'IN_PROGRESS';
    generateBoard();
  }

  // Build and fill the rows before inserting them, so the board notifies once
  function generateBoard() {
    const rows = Array.from({ length: gameState.numGuesses }, () => 
      Array.from(theWord(), (_, index) => new Tile(index)),
    );

    gameState.guesses.forEach((guess, i) => {
      rows[i].forEach((tile, j) => {
        tile.letter = guess[j];
      });
      Tile.updateStatusesForRow(rows[i], theWord());
    });

    board.splice(0, board.length, ...rows);
  }

  function onKeyPress({ e }) {
    if (gameState.status !== 'IN_PROGRESS') return;

    let key = e.key;
    if (e.type === 'click') {
      const button = e.target.closest('button');
      if (!button) return;
      // Prevent a later physical Enter from clicking the focused key
      button.blur();
      key = button.textContent;
    }

    if (/^[a-z]$/i.test(key)) {
      currentRow().find((tile) => !tile.letter)?.fill(key);
    } else if (key === 'Backspace') {
      if (gameState.errors) {
        clearError();
      }
      currentRow().findLast((tile) => tile.letter)?.empty();
    } else if (key === 'Enter') {
      submitGuess();
    }
  }

  function submitGuess() {
    const guess = currentGuess();
    if (guess.length < theWord().length) return;

    if (!validWords.has(guess)) {
      gameState.errors = true;
      gameState.message = 'Not a word.';
      return;
    }

    gameState.guesses.push(guess);
    Tile.updateStatusesForRow(currentRow(), theWord());

    if (guess === theWord()) {
      gameState.status = 'WIN';
      gameState.message = 'You win!';
    } else if (gameState.currentRowIndex >= gameState.numGuesses - 1) {
      gameState.status = 'LOSE';
      gameState.message = `Sorry, the word is "${theWord().toUpperCase()}"`;
    } else {
      gameState.currentRowIndex++;
    }
  }

  return {
    board,
    letters,
    newGame,
    onKeyPress,
    get message() {
      return gameState.message;
    }, 
    canPlayAgain: () => gameState.status === 'WIN' || gameState.status === 'LOSE',
    keyStatus: ({ render }) => keyStatuses()[render.item.toLowerCase()] ?? null,
    rowStatus: ({ render }) => ({
      current: gameState.currentRowIndex === render.index,
      invalid: gameState.currentRowIndex === render.index && gameState.errors,
    }),
    connect() {
      if (gameState.status === 'NONE') {
        newGame();
        return;
      }
      if (gameState.errors) clearError();
      generateBoard();
    },
  };
}
