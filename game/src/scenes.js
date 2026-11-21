// The six reef scenes. Each scene is data, not pictures: the painter in draw.js
// renders the same list twice, once for the left panel and once for the right,
// and the differences are declared here as element variants. A difference is
// always an element whose `diff` says how the right picture changes it:
//   missing — drawn on the left only
//   extra   — drawn on the right only
//   color   — drawn in `alt` colour on the right
//   flip    — faces the other way on the right
//   size    — drawn bigger on the right
//   state   — drawn in its alternate pose on the right (eye shut, chest open…)
// Every scene has exactly 8 differences, all fair: each one is a real thing in
// the picture, big enough to see once you look at it, small enough to miss.
// Coordinates are inside one 600x528 panel; the sand line is near y=440.
import { DIFFS_PER_SCENE } from './config.js';

function diffsOf(elements) {
  const list = [];
  for (const el of elements) {
    if (!el.diff) continue;
    list.push({ id: el.diff.id, x: el.x, y: el.y, r: el.diff.r, kind: el.diff.kind });
  }
  return list;
}

function scene(name, subtitle, water, sand, seed, elements) {
  const diffs = diffsOf(elements);
  if (diffs.length !== DIFFS_PER_SCENE) throw new Error(`${name}: ${diffs.length} differences, need ${DIFFS_PER_SCENE}`);
  return { name, subtitle, water, sand, seed, elements, diffs };
}

export const SCENES = [
  scene(
    'Coral Garden', 'where the reef wakes up',
    { top: '#1b7fa8', bottom: '#0a4a6b' }, '#e8d5a3', 11,
    [
      { type: 'coral', x: 80, y: 440, w: 70, h: 120, color: '#ff7b9c', branches: 5, diff: { id: 'cg-coral-tall', kind: 'size', r: 34 } },
      { type: 'coral', x: 185, y: 445, w: 56, h: 90, color: '#ff9f43', branches: 4 },
      { type: 'coral', x: 320, y: 438, w: 64, h: 110, color: '#b388ff', alt: '#2ee6a8', branches: 5, diff: { id: 'cg-coral-color', kind: 'color', r: 30 } },
      { type: 'coral', x: 470, y: 442, w: 60, h: 96, color: '#ff7b9c', branches: 4 },
      { type: 'coral', x: 545, y: 445, w: 44, h: 70, color: '#2ee6a8', branches: 3 },
      { type: 'seaweed', x: 30, y: 445, h: 90, color: '#2f9e6e' },
      { type: 'seaweed', x: 250, y: 445, h: 70, color: '#37b57e' },
      { type: 'seaweed', x: 420, y: 445, h: 84, color: '#2f9e6e' },
      { type: 'seaweed', x: 580, y: 445, h: 64, color: '#37b57e' },
      { type: 'fish', x: 150, y: 180, size: 26, color: '#ffd166', dir: 1, diff: { id: 'cg-fish-gone', kind: 'missing', r: 30 } },
      { type: 'fish', x: 350, y: 140, size: 22, color: '#4fc3f7', dir: 1, diff: { id: 'cg-fish-turn', kind: 'flip', r: 26 } },
      { type: 'fish', x: 480, y: 230, size: 24, color: '#ff8a5c', dir: -1 },
      { type: 'fish', x: 260, y: 300, size: 18, color: '#ffd166', dir: 1 },
      { type: 'starfish', x: 90, y: 480, size: 22, color: '#ff8a5c', rot: 0 },
      { type: 'starfish', x: 520, y: 472, size: 20, color: '#ff7b9c', rot: 0.5, diff: { id: 'cg-star-gone', kind: 'missing', r: 24 } },
      { type: 'shell', x: 240, y: 492, size: 18, color: '#f2c9e0', alt: '#ffd166', diff: { id: 'cg-shell-color', kind: 'color', r: 20 } },
      { type: 'shell', x: 400, y: 496, size: 16, color: '#c9b8f2' },
      { type: 'shell', x: 300, y: 500, size: 15, color: '#ffd166', diff: { id: 'cg-shell-extra', kind: 'extra', r: 18 } },
      { type: 'bubble', x: 500, y: 120, r: 9, diff: { id: 'cg-bubble-gone', kind: 'missing', r: 14 } },
      { type: 'bubble', x: 516, y: 96, r: 6 },
      { type: 'bubble', x: 120, y: 90, r: 7 },
      { type: 'bubble', x: 140, y: 66, r: 5 },
      { type: 'rock', x: 60, y: 452, w: 70, h: 26, color: '#7d8a96' },
      { type: 'rock', x: 520, y: 455, w: 60, h: 22, color: '#6b7a88' },
    ],
  ),
  scene(
    'Turtle Lagoon', 'slow circles in green water',
    { top: '#2a9d8f', bottom: '#0d5c52' }, '#e2d09a', 23,
    [
      { type: 'turtle', x: 300, y: 250, size: 110, diff: { id: 'tl-turtle-eye', kind: 'state', r: 40 } },
      { type: 'fish', x: 120, y: 150, size: 20, color: '#ffd166', dir: 1 },
      { type: 'fish', x: 165, y: 178, size: 18, color: '#ffd166', dir: 1, diff: { id: 'tl-school-gone', kind: 'missing', r: 22 } },
      { type: 'fish', x: 205, y: 150, size: 20, color: '#ffd166', dir: 1 },
      { type: 'fish', x: 470, y: 170, size: 22, color: '#ff8a5c', dir: -1 },
      { type: 'fish', x: 520, y: 320, size: 18, color: '#4fc3f7', dir: -1, alt: '#ff8a5c', diff: { id: 'tl-fish-color', kind: 'color', r: 22 } },
      { type: 'ray', x: 460, y: 90, size: 46, diff: { id: 'tl-ray-gone', kind: 'missing', r: 34 } },
      { type: 'seaweed', x: 40, y: 445, h: 110, color: '#2f9e6e' },
      { type: 'seaweed', x: 90, y: 445, h: 80, color: '#37b57e' },
      { type: 'seaweed', x: 560, y: 445, h: 96, color: '#2f9e6e', diff: { id: 'tl-weed-gone', kind: 'missing', r: 26 } },
      { type: 'coral', x: 520, y: 440, w: 50, h: 80, color: '#ff7b9c', alt: '#2ee6a8', branches: 4, diff: { id: 'tl-coral-color', kind: 'color', r: 28 } },
      { type: 'coral', x: 60, y: 445, w: 44, h: 66, color: '#b388ff', branches: 3 },
      { type: 'shell', x: 200, y: 494, size: 17, color: '#f2c9e0' },
      { type: 'shell', x: 340, y: 498, size: 15, color: '#ffd166', diff: { id: 'tl-shell-extra', kind: 'extra', r: 18 } },
      { type: 'starfish', x: 440, y: 482, size: 20, color: '#ff8a5c', rot: 0.3 },
      { type: 'bubble', x: 300, y: 120, r: 8 },
      { type: 'bubble', x: 318, y: 96, r: 5, diff: { id: 'tl-bubble-gone', kind: 'missing', r: 12 } },
      { type: 'bubble', x: 80, y: 260, r: 6 },
      { type: 'rock', x: 480, y: 452, w: 80, h: 24, color: '#7d8a96' },
    ],
  ),
  scene(
    'Anemone Alley', 'clownfish among the stingers',
    { top: '#1f7fa8', bottom: '#123a5e' }, '#e8d5a3', 37,
    [
      { type: 'anemone', x: 120, y: 430, size: 62, color: '#c77dff', diff: { id: 'aa-anemone-color', kind: 'color', r: 34, alt: '#ff7b9c' } },
      { type: 'anemone', x: 300, y: 435, size: 70, color: '#ff7b9c' },
      { type: 'anemone', x: 480, y: 430, size: 58, color: '#c77dff', diff: { id: 'aa-anemone-tall', kind: 'size', r: 32 } },
      { type: 'clownfish', x: 120, y: 360, size: 24, dir: 1 },
      { type: 'clownfish', x: 300, y: 350, size: 26, dir: -1, diff: { id: 'aa-clown-gone', kind: 'missing', r: 28 } },
      { type: 'clownfish', x: 480, y: 355, size: 22, dir: 1 },
      { type: 'fish', x: 220, y: 150, size: 20, color: '#4fc3f7', dir: 1 },
      { type: 'fish', x: 420, y: 120, size: 18, color: '#ffd166', dir: -1, diff: { id: 'aa-fish-turn', kind: 'flip', r: 22 } },
      { type: 'coral', x: 40, y: 445, w: 46, h: 72, color: '#ff9f43', branches: 3 },
      { type: 'coral', x: 560, y: 445, w: 48, h: 78, color: '#2ee6a8', branches: 3, diff: { id: 'aa-coral-tall', kind: 'size', r: 28 } },
      { type: 'seaweed', x: 200, y: 445, h: 76, color: '#2f9e6e' },
      { type: 'seaweed', x: 400, y: 445, h: 68, color: '#37b57e' },
      { type: 'starfish', x: 200, y: 484, size: 20, color: '#ff8a5c', rot: 0 },
      { type: 'starfish', x: 380, y: 488, size: 18, color: '#ff7b9c', rot: 0.6, diff: { id: 'aa-star-extra', kind: 'extra', r: 20 } },
      { type: 'shell', x: 90, y: 494, size: 16, color: '#c9b8f2', diff: { id: 'aa-shell-gone', kind: 'missing', r: 18 } },
      { type: 'shell', x: 500, y: 496, size: 17, color: '#f2c9e0' },
      { type: 'bubble', x: 300, y: 240, r: 7 },
      { type: 'bubble', x: 318, y: 216, r: 5 },
      { type: 'bubble', x: 520, y: 200, r: 8, diff: { id: 'aa-bubble-gone', kind: 'missing', r: 12 } },
      { type: 'rock', x: 250, y: 452, w: 66, h: 22, color: '#7d8a96' },
    ],
  ),
  scene(
    'The Shipwreck', 'gold sleeps in the broken hull',
    { top: '#2b6a8f', bottom: '#0e3a56' }, '#d9c48f', 51,
    [
      { type: 'wreck', x: 90, y: 300, w: 330, h: 150 },
      { type: 'chest', x: 460, y: 430, size: 52, diff: { id: 'sw-chest-open', kind: 'state', r: 30 } },
      { type: 'octopus', x: 520, y: 200, size: 54, color: '#b388ff', diff: { id: 'sw-octopus-arm', kind: 'state', r: 36 } },
      { type: 'anchor', x: 60, y: 380, size: 56, diff: { id: 'sw-anchor-flip', kind: 'flip', r: 30 } },
      { type: 'fish', x: 200, y: 140, size: 20, color: '#ffd166', dir: 1 },
      { type: 'fish', x: 420, y: 110, size: 18, color: '#4fc3f7', dir: -1, diff: { id: 'sw-fish-gone', kind: 'missing', r: 22 } },
      { type: 'fish', x: 500, y: 320, size: 18, color: '#ff8a5c', alt: '#4fc3f7', dir: -1, diff: { id: 'sw-fish-color', kind: 'color', r: 22 } },
      { type: 'coin', x: 440, y: 478, size: 10, diff: { id: 'sw-coin-gone', kind: 'missing', r: 14 } },
      { type: 'coin', x: 470, y: 486, size: 10 },
      { type: 'coin', x: 500, y: 480, size: 10 },
      { type: 'coral', x: 400, y: 440, w: 44, h: 64, color: '#ff7b9c', branches: 3 },
      { type: 'seaweed', x: 30, y: 445, h: 84, color: '#2f9e6e' },
      { type: 'seaweed', x: 570, y: 445, h: 72, color: '#37b57e' },
      { type: 'shell', x: 300, y: 496, size: 16, color: '#f2c9e0' },
      { type: 'crab', x: 180, y: 480, size: 22, diff: { id: 'sw-crab-extra', kind: 'extra', r: 24 } },
      { type: 'bubble', x: 520, y: 130, r: 8 },
      { type: 'bubble', x: 540, y: 104, r: 5, diff: { id: 'sw-bubble-gone', kind: 'missing', r: 12 } },
      { type: 'rock', x: 120, y: 452, w: 70, h: 24, color: '#6b7a88' },
    ],
  ),
  scene(
    'Deep Trench', 'where the light lives in fish',
    { top: '#0b2a4d', bottom: '#04101f' }, '#c9b586', 67,
    [
      { type: 'angler', x: 300, y: 240, size: 84, diff: { id: 'dt-lure-color', kind: 'color', r: 44, alt: '#2ee6a8' } },
      { type: 'jellyfish', x: 130, y: 150, size: 40, color: '#e0aaff' },
      { type: 'jellyfish', x: 470, y: 170, size: 34, color: '#a0c4ff', diff: { id: 'dt-jelly-gone', kind: 'missing', r: 30 } },
      { type: 'jellyfish', x: 380, y: 330, size: 28, color: '#e0aaff', diff: { id: 'dt-jelly-big', kind: 'size', r: 30 } },
      { type: 'jellyfish', x: 220, y: 330, size: 24, color: '#a0c4ff', diff: { id: 'dt-jelly-extra', kind: 'extra', r: 26 } },
      { type: 'fish', x: 500, y: 90, size: 16, color: '#ffd166', dir: -1, diff: { id: 'dt-fish-gone', kind: 'missing', r: 20 } },
      { type: 'fish', x: 100, y: 300, size: 16, color: '#ffd166', dir: 1 },
      { type: 'rock', x: 60, y: 440, w: 90, h: 40, color: '#4a5568' },
      { type: 'rock', x: 460, y: 445, w: 100, h: 36, color: '#4a5568', diff: { id: 'dt-rock-tall', kind: 'size', r: 34 } },
      { type: 'coral', x: 520, y: 445, w: 40, h: 56, color: '#5e60ce', branches: 3 },
      { type: 'seaweed', x: 30, y: 445, h: 70, color: '#1f7a5c' },
      { type: 'glow', x: 90, y: 90, r: 5 },
      { type: 'glow', x: 540, y: 260, r: 5, diff: { id: 'dt-glow-gone', kind: 'missing', r: 12 } },
      { type: 'glow', x: 200, y: 60, r: 4 },
      { type: 'bubble', x: 300, y: 140, r: 6 },
      { type: 'shell', x: 330, y: 492, size: 15, color: '#c9b8f2' },
      { type: 'starfish', x: 430, y: 484, size: 18, color: '#7b6fd0', alt: '#ff8a5c', rot: 0.2, diff: { id: 'dt-star-color', kind: 'color', r: 20 } },
    ],
  ),
  scene(
    'Seahorse Meadow', 'a garden that sways',
    { top: '#1b8a7a', bottom: '#0a4a44' }, '#e8d5a3', 83,
    [
      { type: 'seahorse', x: 150, y: 300, size: 84, color: '#ffb703', diff: { id: 'sm-horse-color', kind: 'color', r: 36, alt: '#ff7b9c' } },
      { type: 'seahorse', x: 330, y: 270, size: 92, color: '#fb8500', diff: { id: 'sm-horse-gone', kind: 'missing', r: 38 } },
      { type: 'seahorse', x: 490, y: 310, size: 76, color: '#ffb703' },
      { type: 'clam', x: 250, y: 470, size: 54, diff: { id: 'sm-pearl-gone', kind: 'state', r: 30 } },
      { type: 'seaweed', x: 30, y: 445, h: 130, color: '#2f9e6e' },
      { type: 'seaweed', x: 70, y: 445, h: 100, color: '#37b57e' },
      { type: 'seaweed', x: 420, y: 445, h: 120, color: '#2f9e6e' },
      { type: 'seaweed', x: 570, y: 445, h: 104, color: '#37b57e' },
      { type: 'fish', x: 220, y: 130, size: 18, color: '#4fc3f7', dir: 1 },
      { type: 'fish', x: 420, y: 100, size: 18, color: '#ffd166', dir: -1, diff: { id: 'sm-fish-extra', kind: 'extra', r: 22 } },
      { type: 'coral', x: 560, y: 445, w: 44, h: 70, color: '#ff7b9c', branches: 3, diff: { id: 'sm-coral-tall', kind: 'size', r: 26 } },
      { type: 'starfish', x: 90, y: 484, size: 20, color: '#ff8a5c', rot: 0 },
      { type: 'starfish', x: 380, y: 488, size: 18, color: '#ff7b9c', rot: 0.4, diff: { id: 'sm-star-extra', kind: 'extra', r: 20 } },
      { type: 'shell', x: 150, y: 496, size: 16, color: '#f2c9e0', alt: '#ffd166', diff: { id: 'sm-shell-color', kind: 'color', r: 18 } },
      { type: 'shell', x: 460, y: 494, size: 15, color: '#c9b8f2' },
      { type: 'bubble', x: 490, y: 180, r: 7 },
      { type: 'bubble', x: 508, y: 156, r: 5, diff: { id: 'sm-bubble-gone', kind: 'missing', r: 12 } },
      { type: 'rock', x: 300, y: 452, w: 70, h: 24, color: '#7d8a96' },
    ],
  ),
];

export function diffsRemaining(scene, found) {
  return scene.diffs.filter((d) => !found.has(d.id));
}
