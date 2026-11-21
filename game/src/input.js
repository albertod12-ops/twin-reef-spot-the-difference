// Pointer and keyboard input. The mouse moves one cursor; the arrow keys move
// the same cursor, so a click and Enter/Space always check the same spot.
// One-shot presses are queued as actions and taken once by the loop.
export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_MAGNIFIER = 4;
export const ACTION_SOUND = 8;
export const ACTION_PAUSE = 16;
export const ACTION_NEXT = 32;
export const ACTION_RESTART = 64;

export function createInput(canvas, toField) {
  const cursor = { x: 324, y: 340, usingKeys: false };
  const pointer = { x: 324, y: 340, inside: false };
  const clicks = [];
  let actions = 0;

  function setFromClient(clientX, clientY) {
    const p = toField(clientX, clientY);
    cursor.x = p.x;
    cursor.y = p.y;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.inside = true;
  }

  canvas.addEventListener('pointermove', (event) => {
    setFromClient(event.clientX, event.clientY);
    cursor.usingKeys = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    setFromClient(event.clientX, event.clientY);
    clicks.push({ x: cursor.x, y: cursor.y });
  });
  canvas.addEventListener('pointerleave', () => {
    pointer.inside = false;
  });

  window.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 2 : 10;
    if (event.code === 'ArrowLeft') { cursor.x = Math.max(0, cursor.x - step); cursor.usingKeys = true; event.preventDefault(); }
    else if (event.code === 'ArrowRight') { cursor.x = Math.min(1280, cursor.x + step); cursor.usingKeys = true; event.preventDefault(); }
    else if (event.code === 'ArrowUp') { cursor.y = Math.max(0, cursor.y - step); cursor.usingKeys = true; event.preventDefault(); }
    else if (event.code === 'ArrowDown') { cursor.y = Math.min(720, cursor.y + step); cursor.usingKeys = true; event.preventDefault(); }
    else if (event.code === 'Enter' || event.code === 'Space') { if (!event.repeat) actions |= ACTION_CONFIRM; event.preventDefault(); }
    else if (event.code === 'KeyH') { if (!event.repeat) actions |= ACTION_HINT; }
    else if (event.code === 'KeyM') { if (!event.repeat) actions |= ACTION_MAGNIFIER; }
    else if (event.code === 'KeyS') { if (!event.repeat) actions |= ACTION_SOUND; }
    else if (event.code === 'KeyP' || event.code === 'Escape') { if (!event.repeat) actions |= ACTION_PAUSE; }
    else if (event.code === 'KeyN') { if (!event.repeat) actions |= ACTION_NEXT; }
    else if (event.code === 'KeyR') { if (!event.repeat) actions |= ACTION_RESTART; }
  });
  window.addEventListener('blur', () => { pointer.inside = false; });

  return {
    cursor,
    pointer,
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
  };
}
