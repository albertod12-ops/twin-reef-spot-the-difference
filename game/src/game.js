// The game's rules and state, with no drawing and no browser in it: which scene
// is open, which differences are found, the clock, the score, hints and misses.
// A click is checked against the open scene's differences in either panel.
import { DIFFS_PER_SCENE, HINTS_PER_SCENE, POINTS_FOUND, POINTS_HINT, POINTS_MISS, SCENE_TIME, TIME_BONUS_PER_SECOND } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_FINAL = 'final';
export const SCREEN_TIMEOUT = 'timeout';
export const SCREEN_PAUSED = 'paused';

export function createGame() {
  const state = {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    score: 0,
    totalFound: 0,
    totalClicks: 0,
    totalMisses: 0,
    hintsLeft: HINTS_PER_SCENE,
    hintsUsed: 0,
    timeLeft: SCENE_TIME,
    sceneBonus: 0,
    hintPulse: null, // {id, until} — a hint ring shown on both panels
    missFlash: null, // {x, y, panel, until} — a red X where a click missed
    foundPop: null, // {id, until} — the newest found ring, drawn bigger briefly
    elapsed: 0,
    best: 0,
  };

  function scene() {
    return SCENES[state.sceneIndex];
  }

  function openScene(index) {
    state.sceneIndex = index;
    state.found = new Set();
    state.hintsLeft = HINTS_PER_SCENE;
    state.timeLeft = SCENE_TIME;
    state.hintPulse = null;
    state.missFlash = null;
    state.foundPop = null;
    state.screen = SCREEN_PLAY;
  }

  function start() {
    state.score = 0;
    state.totalFound = 0;
    state.totalClicks = 0;
    state.totalMisses = 0;
    state.hintsUsed = 0;
    state.elapsed = 0;
    openScene(0);
  }

  /** Check a click at panel-local (x, y) in either panel. Returns 'found' | 'miss' | 'none'. */
  function checkClick(x, y) {
    if (state.screen !== SCREEN_PLAY) return 'none';
    state.totalClicks += 1;
    for (const d of scene().diffs) {
      if (state.found.has(d.id)) continue;
      const dx = x - d.x;
      const dy = y - d.y;
      if (dx * dx + dy * dy <= (d.r + 8) * (d.r + 8)) {
        state.found.add(d.id);
        state.totalFound += 1;
        state.score += POINTS_FOUND;
        state.foundPop = { id: d.id, until: state.elapsed + 0.6 };
        if (state.found.size === DIFFS_PER_SCENE) {
          state.sceneBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
          state.score += state.sceneBonus;
          state.screen = state.sceneIndex === SCENES.length - 1 ? SCREEN_FINAL : SCREEN_CLEAR;
          return 'clear';
        }
        return 'found';
      }
    }
    state.totalMisses += 1;
    state.score = Math.max(0, state.score - POINTS_MISS);
    state.missFlash = { x, y, until: state.elapsed + 0.7 };
    return 'miss';
  }

  /** Spend a hint: pulse one still-hidden difference on both panels. */
  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return null;
    const remaining = scene().diffs.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return null;
    const pick = remaining[Math.floor(Math.random() * remaining.length)];
    state.hintsLeft -= 1;
    state.hintsUsed += 1;
    state.score = Math.max(0, state.score - POINTS_HINT);
    state.hintPulse = { id: pick.id, until: state.elapsed + 2.2 };
    return pick;
  }

  function nextScene() {
    if (state.screen === SCREEN_CLEAR) openScene(state.sceneIndex + 1);
  }

  function retryScene() {
    openScene(state.sceneIndex);
  }

  function tick(dt) {
    state.elapsed += dt;
    if (state.screen !== SCREEN_PLAY) return;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_TIMEOUT;
    }
  }

  function accuracy() {
    if (state.totalClicks === 0) return 100;
    return Math.round(((state.totalClicks - state.totalMisses) / state.totalClicks) * 100);
  }

  return {
    state,
    scene,
    start,
    openScene,
    checkClick,
    useHint,
    nextScene,
    retryScene,
    tick,
    accuracy,
    sceneCount: SCENES.length,
  };
}
