// The screenshot scenes behind ?shot=start|play|end. Each one stages a real
// game state — a title over the first reef, a mid-hunt with markers on found
// differences and several still hidden, and the final screen — then paints it
// twice and sets window.__shotReady, so a screenshot is the same frame every
// time. Query knobs: ?shot=play&scene=3&found=2 stages scene 4 with its first
// two differences found; &mag=1 turns the magnifier on over a hidden one.
import { PANEL } from './config.js';
import { SCREEN_FINAL, SCREEN_TITLE } from './game.js';

export function stageShot(name, game, params) {
  const sceneIndex = Math.min(Math.max(0, Number.parseInt(params.get('scene') ?? '0', 10) || 0), game.sceneCount - 1);
  const foundCount = Math.min(Math.max(0, Number.parseInt(params.get('found') ?? '3', 10) || 0), 8);
  if (name === 'end') {
    game.state.sceneIndex = game.sceneCount - 1;
    game.state.found = new Set(game.scene().diffs.map((d) => d.id));
    game.state.score = 4850;
    game.state.totalFound = 48;
    game.state.totalClicks = 52;
    game.state.totalMisses = 4;
    game.state.hintsUsed = 2;
    game.state.timeLeft = 41;
    game.state.screen = SCREEN_FINAL;
    game.state.best = 4850;
    return { screen: SCREEN_FINAL };
  }
  if (name === 'play') {
    game.openScene(sceneIndex);
    const scene = game.scene();
    for (let i = 0; i < foundCount; i += 1) game.state.found.add(scene.diffs[i].id);
    game.state.score = foundCount * 100 + 50;
    game.state.totalFound = foundCount;
    game.state.totalClicks = foundCount + 1;
    game.state.totalMisses = 1;
    game.state.timeLeft = 118;
    game.state.elapsed = 32;
    return { screen: 'play', sceneIndex, foundCount };
  }
  game.state.sceneIndex = 0;
  game.state.screen = SCREEN_TITLE;
  game.state.best = 0;
  return { screen: SCREEN_TITLE };
}

/** Where the magnifier should sit for a staged play shot: over a difference. */
export function shotMagnifierTarget(game) {
  const scene = game.scene();
  const hidden = scene.diffs.find((d) => !game.state.found.has(d.id));
  if (!hidden) return null;
  return { x: PANEL.rightX + hidden.x, y: PANEL.y + hidden.y };
}
