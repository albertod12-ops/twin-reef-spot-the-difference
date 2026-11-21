// Every tuning number and colour in one place. The playfield is a fixed 1280x720
// logical area; the renderer scales it to the window, so no rule depends on the
// screen size. Two reef pictures sit side by side inside it.
export const FIELD = { width: 1280, height: 720 };

export const HEADER = { height: 64 };
export const FOOTER = { top: 616, height: 104 };

// One picture panel: 600 wide, 528 tall. Left starts at x=24, right at x=656.
export const PANEL = { width: 600, height: 528, y: 76, leftX: 24, rightX: 656, gap: 32 };

export const DIFFS_PER_SCENE = 8;
export const SCENE_TIME = 150; // seconds on the clock for each scene
export const HINTS_PER_SCENE = 3;
export const POINTS_FOUND = 100;
export const POINTS_HINT = 50;
export const POINTS_MISS = 25;
export const TIME_BONUS_PER_SECOND = 5;

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const PALETTE = {
  backdrop: '#06283a',
  header: '#07344a',
  headerText: '#eaf7ff',
  muted: '#9fc6d8',
  gold: '#ffd166',
  coral: '#ff6b6b',
  panelFrame: '#0e4a63',
  panelLabel: '#eaf7ff',
  foundRing: '#2ee6a8',
  foundNumber: '#06283a',
  hintRing: '#ffd166',
  missX: '#ff5252',
  timerGood: '#2ee6a8',
  timerLow: '#ff5252',
  button: '#0e4a63',
  buttonText: '#eaf7ff',
  overlay: 'rgba(4, 32, 46, 0.88)',
  title: '#eaf7ff',
};

export const BEST_KEY = 'twin-reef.best';
export const SOUND_KEY = 'twin-reef.sound';
