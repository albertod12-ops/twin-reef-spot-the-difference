// Boot and the one loop: input is read every frame, the clock ticks while a
// scene is open, and the renderer paints what is there. The game moves between
// six screens: title, play, paused, scene clear, final and out of time.
//
// ?shot=start|play|end (with &scene=N, &found=N, &mag=1) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady.
import { BEST_KEY, PANEL, SOUND_KEY } from './config.js';
import { createGame, SCREEN_CLEAR, SCREEN_FINAL, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TIMEOUT, SCREEN_TITLE } from './game.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MAGNIFIER, ACTION_NEXT, ACTION_PAUSE, ACTION_RESTART, ACTION_SOUND, createInput } from './input.js';
import { BUTTONS, createRenderer } from './render.js';
import { createSound } from './sound.js';
import { shotMagnifierTarget, stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const game = createGame();
const renderer = createRenderer(canvas);
const input = createInput(canvas, (x, y) => renderer.toField(x, y));
const sound = createSound(window.localStorage.getItem(SOUND_KEY) !== 'off');

const ui = { cursor: input.cursor, magnifier: false, soundOn: sound.isOn() };
let animTime = 0;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

game.state.best = readBest();

function announce(message) {
  status.textContent = message;
}

/** Which panel a playfield point is in, with panel-local coordinates, or null. */
function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { side: 0, lx: x - PANEL.leftX, ly: y - PANEL.y };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { side: 1, lx: x - PANEL.rightX, ly: y - PANEL.y };
  }
  return null;
}

function buttonAt(x, y) {
  for (const b of BUTTONS) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}

function checkAt(x, y) {
  const hit = panelAt(x, y);
  if (!hit) return;
  const result = game.checkClick(hit.lx, hit.ly);
  if (result === 'found') {
    sound.found();
    announce(`Found one! ${game.state.found.size} of 8. ${8 - game.state.found.size} remain.`);
  } else if (result === 'clear') {
    sound.clear();
    if (game.state.screen === SCREEN_FINAL) {
      if (game.state.score > game.state.best) {
        game.state.best = game.state.score;
        saveBest(game.state.best);
      }
      sound.win();
      announce(`Reef Master! Final score ${game.state.score}.`);
    } else {
      announce(`Scene clear! Bonus ${game.state.sceneBonus}. Next scene.`);
    }
  } else if (result === 'miss') {
    game.state.missFlash.panel = hit.side;
    sound.miss();
    announce('Not a difference. 25 points lost.');
  }
}

function handleClick(x, y) {
  const screen = game.state.screen;
  if (screen === SCREEN_TITLE) {
    sound.click();
    game.start();
    announce('Playing. Find 8 differences in each scene.');
    return;
  }
  if (screen === SCREEN_CLEAR) {
    sound.click();
    game.nextScene();
    return;
  }
  if (screen === SCREEN_FINAL) {
    sound.click();
    game.start();
    return;
  }
  if (screen === SCREEN_TIMEOUT) {
    sound.click();
    game.retryScene();
    announce('Trying this scene again.');
    return;
  }
  if (screen === SCREEN_PAUSED) {
    game.state.screen = SCREEN_PLAY;
    announce('Playing.');
    return;
  }
  const button = buttonAt(x, y);
  if (button === 'hint') {
    if (game.useHint()) {
      sound.hint();
      announce('Hint: a golden ring pulses around a difference you have not found.');
    }
    return;
  }
  if (button === 'mag') {
    ui.magnifier = !ui.magnifier;
    sound.click();
    return;
  }
  if (button === 'sound') {
    sound.setOn(!sound.isOn());
    ui.soundOn = sound.isOn();
    try {
      window.localStorage.setItem(SOUND_KEY, sound.isOn() ? 'on' : 'off');
    } catch {
      // Storage off: the setting lasts this visit only.
    }
    sound.click();
    return;
  }
  checkAt(x, y);
}

function handleActions() {
  const actions = input.takeActions();
  const screen = game.state.screen;
  if (actions & ACTION_PAUSE) {
    if (screen === SCREEN_PLAY) {
      game.state.screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (screen === SCREEN_PAUSED) {
      game.state.screen = SCREEN_PLAY;
      announce('Playing.');
    }
    return;
  }
  if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
    if (game.useHint()) sound.hint();
  }
  if (actions & ACTION_MAGNIFIER) ui.magnifier = !ui.magnifier;
  if (actions & ACTION_SOUND) {
    sound.setOn(!sound.isOn());
    ui.soundOn = sound.isOn();
    try {
      window.localStorage.setItem(SOUND_KEY, sound.isOn() ? 'on' : 'off');
    } catch {
      // Storage off.
    }
  }
  if (actions & ACTION_RESTART && (screen === SCREEN_PLAY || screen === SCREEN_TIMEOUT)) {
    game.retryScene();
    announce('Trying this scene again.');
  }
  if (actions & ACTION_NEXT && screen === SCREEN_CLEAR) game.nextScene();
  if (actions & ACTION_CONFIRM) {
    if (screen === SCREEN_TITLE) {
      game.start();
      announce('Playing. Find 8 differences in each scene.');
    } else if (screen === SCREEN_CLEAR) game.nextScene();
    else if (screen === SCREEN_FINAL) game.start();
    else if (screen === SCREEN_TIMEOUT) game.retryScene();
    else if (screen === SCREEN_PAUSED) game.state.screen = SCREEN_PLAY;
    else if (screen === SCREEN_PLAY) checkAt(input.cursor.x, input.cursor.y);
  }
}

function handleClicks() {
  for (const click of input.takeClicks()) handleClick(click.x, click.y);
}

function runShot(name) {
  const staged = stageShot(name, game, params);
  if (params.get('mag') === '1' && staged.screen === 'play') {
    ui.magnifier = true;
    const target = shotMagnifierTarget(game);
    if (target) {
      input.cursor.x = target.x;
      input.cursor.y = target.y;
    }
  }
  animTime = 2.4;
  let painted = 0;
  function paint() {
    renderer.draw(game, ui, animTime);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    animTime += dt;
    handleActions();
    handleClicks();
    const before = game.state.screen;
    game.tick(dt);
    if (before === SCREEN_PLAY && game.state.screen === SCREEN_TIMEOUT) {
      sound.timeout();
      announce('Out of time! Try this scene again.');
    }
    renderer.draw(game, ui, animTime);
  }
  announce('Twin Reef. Press Space or click to start.');
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.state.screen === SCREEN_PLAY) {
      game.state.screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });
}

if (shot) runShot(shot);
else runGame();
