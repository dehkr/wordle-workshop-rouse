import { html } from 'hono/html';
import { BaseLayout } from '../layouts/BaseLayout';
import { nl } from '../utils/formatting';

export function HomePage() {
  const pageContent = html`<main
    class="main"
    data-guesses="4"
    data-rz-scope="game"
    data-rz-on="keyup|window: onKeyPress"
  >
    <h1 class="logo" aria-label="TryCat">
      <img src="images/trycat-logotype.svg" alt="TryCat">
    </h1>
    <div class="output">
      <p class="message" data-rz-text="message"></p>
      <template data-rz-render="canPlayAgain">
        <button type="button" class="new-game" data-rz-on="click: newGame">New game</button>
      </template>
    </div>
    <div id="game">
      <template data-rz-render="board">
        <div class="row" data-rz-class="rowStatus">
          <template data-rz-render="%">
            <div class="tile" data-rz-class="%.status" data-rz-text="%.letter"></div>
          </template>
        </div>
      </template>
    </div>
    <div id="keyboard" data-rz-on="click|stop: onKeyPress">
      <template data-rz-render="letters">
        <div class="row">
          <template data-rz-render="%">
            <button
              type="button"
              class="key"
              data-rz-class="keyStatus"
              data-rz-text="%"
            ></button>
          </template>
        </div>
      </template>
    </div>
  </main>`;

  return BaseLayout({
    title: 'Play FatCat',
    description: 'The most fun wordle clone in the world.',
    styles: html`<link rel="preconnect" href="https://fonts.googleapis.com">${nl(2)}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">${nl(2)}<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap">${nl(2)}`,
    children: pageContent,
  });
};
