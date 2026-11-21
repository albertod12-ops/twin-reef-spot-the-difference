// A small deterministic generator (mulberry32) so a scene's decorative specks —
// pebbles, bubbles, light rays — are identical on both panels and across runs
// of the same seed. Differences are never random: they are declared in scenes.js.
export function createRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
