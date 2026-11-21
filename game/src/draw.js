// Drawing only: one reef picture, painted from a scene's element list. The same
// function paints the left panel (variant 0) and the right panel (variant 1);
// the only difference between them is what each element's `diff` declares in
// scenes.js. Decorative specks come from a seeded generator, so both panels
// match speck for speck. `t` is seconds of animation time: seaweed sways, fish
// bob, bubbles rise — the same `t` on both panels, so nothing animates apart.
import { PANEL } from './config.js';
import { createRandom } from './random.js';

function visible(el, variant) {
  if (!el.diff) return true;
  if (el.diff.kind === 'missing') return variant === 0;
  if (el.diff.kind === 'extra') return variant === 1;
  return true;
}

function colorOf(el, variant) {
  if (el.diff && el.diff.kind === 'color' && variant === 1 && el.alt) return el.alt;
  return el.color;
}

function dirOf(el, variant) {
  if (el.diff && el.diff.kind === 'flip' && variant === 1) return -el.dir;
  return el.dir;
}

function scaleOf(el, variant) {
  if (el.diff && el.diff.kind === 'size' && variant === 1) return 1.45;
  return 1;
}

function stateOf(el, variant) {
  return el.diff && el.diff.kind === 'state' && variant === 1;
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function star(ctx, x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2;
    const px = x + Math.cos(a) * rad;
    const py = y + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFishBody(ctx, el, variant, t) {
  const size = el.size * scaleOf(el, variant);
  const dir = dirOf(el, variant);
  const bob = Math.sin(t * 1.4 + el.x * 0.05) * 3;
  const x = el.x;
  const y = el.y + bob;
  ctx.fillStyle = colorOf(el, variant);
  // Tail.
  ctx.beginPath();
  ctx.moveTo(x - dir * size * 0.9, y);
  ctx.lineTo(x - dir * size * 1.5, y - size * 0.55);
  ctx.lineTo(x - dir * size * 1.5, y + size * 0.55);
  ctx.closePath();
  ctx.fill();
  // Body.
  ellipse(ctx, x, y, size, size * 0.62);
  // Fin.
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.5);
  ctx.lineTo(x + dir * size * 0.3, y - size * 0.95);
  ctx.lineTo(x + dir * size * 0.55, y - size * 0.4);
  ctx.closePath();
  ctx.fill();
  return { x, y, size, dir };
}

function drawFish(ctx, el, variant, t) {
  const body = drawFishBody(ctx, el, variant, t);
  ctx.fillStyle = '#06283a';
  circle(ctx, body.x + body.dir * body.size * 0.45, body.y - body.size * 0.12, Math.max(2, body.size * 0.11));
}

function drawClownfish(ctx, el, variant, t) {
  const body = drawFishBody(ctx, { ...el, color: '#ff8a3d' }, variant, t);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(body.x - body.size * 0.25, body.y - body.size * 0.5, body.size * 0.16, body.size);
  ctx.fillRect(body.x + body.size * 0.3, body.y - body.size * 0.5, body.size * 0.16, body.size);
  ctx.fillStyle = '#06283a';
  circle(ctx, body.x + body.dir * body.size * 0.45, body.y - body.size * 0.12, Math.max(2, body.size * 0.11));
}

function drawCoral(ctx, el, variant) {
  const s = scaleOf(el, variant);
  const h = el.h * s;
  const w = el.w;
  ctx.strokeStyle = colorOf(el, variant);
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(5, w * 0.16);
  const baseX = el.x;
  const baseY = el.y;
  for (let b = 0; b < el.branches; b += 1) {
    const spread = (b - (el.branches - 1) / 2) * (w / el.branches);
    const tipX = baseX + spread * 1.6;
    const tipY = baseY - h * (0.75 + ((b * 37) % 25) / 100);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(baseX + spread * 0.4, baseY - h * 0.5, tipX, tipY);
    ctx.stroke();
    ctx.fillStyle = colorOf(el, variant);
    circle(ctx, tipX, tipY, Math.max(4, w * 0.09));
  }
  ctx.fillStyle = colorOf(el, variant);
  ellipse(ctx, baseX, baseY - 4, w * 0.5, 10);
}

function drawSeaweed(ctx, el, variant, t) {
  const sway = Math.sin(t * 0.9 + el.x * 0.08) * 10;
  ctx.strokeStyle = el.color;
  ctx.lineCap = 'round';
  for (let b = -1; b <= 1; b += 1) {
    ctx.lineWidth = 7 - Math.abs(b);
    ctx.beginPath();
    ctx.moveTo(el.x + b * 9, el.y);
    ctx.quadraticCurveTo(el.x + b * 9 + sway * 0.4, el.y - el.h * 0.55, el.x + b * 14 + sway, el.y - el.h);
    ctx.stroke();
  }
}

function drawStarfish(ctx, el, variant) {
  ctx.fillStyle = colorOf(el, variant);
  star(ctx, el.x, el.y, el.size * scaleOf(el, variant), el.rot);
  ctx.fillStyle = 'rgba(6, 40, 58, 0.35)';
  circle(ctx, el.x, el.y, el.size * 0.18);
}

function drawShell(ctx, el, variant) {
  const s = el.size * scaleOf(el, variant);
  ctx.fillStyle = colorOf(el, variant);
  ctx.beginPath();
  ctx.arc(el.x, el.y, s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(6, 40, 58, 0.35)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(el.x, el.y);
    ctx.lineTo(el.x + i * s * 0.4, el.y - s * 0.9);
    ctx.stroke();
  }
}

function drawBubble(ctx, el, variant, t) {
  const rise = (t * 12 + el.x * 7) % 60;
  ctx.strokeStyle = 'rgba(234, 247, 255, 0.75)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(el.x, el.y - rise, el.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  circle(ctx, el.x - el.r * 0.3, el.y - rise - el.r * 0.3, Math.max(1.5, el.r * 0.22));
}

function drawRock(ctx, el, variant) {
  const s = scaleOf(el, variant);
  ctx.fillStyle = el.color;
  ellipse(ctx, el.x, el.y, el.w, el.h * s);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
  ellipse(ctx, el.x - el.w * 0.25, el.y - el.h * 0.3, el.w * 0.4, el.h * 0.35);
}

function drawTurtle(ctx, el, variant, t) {
  const s = el.size / 110;
  const x = el.x;
  const y = el.y + Math.sin(t * 0.8) * 4;
  const closed = stateOf(el, variant);
  ctx.fillStyle = '#3d9e6d';
  // Flippers.
  ellipse(ctx, x - 62 * s, y - 18 * s, 22 * s, 9 * s);
  ellipse(ctx, x + 62 * s, y - 18 * s, 22 * s, 9 * s);
  ellipse(ctx, x - 52 * s, y + 22 * s, 18 * s, 8 * s);
  ellipse(ctx, x + 52 * s, y + 22 * s, 18 * s, 8 * s);
  // Head.
  ellipse(ctx, x + 78 * s, y - 6 * s, 20 * s, 14 * s);
  if (closed) {
    ctx.strokeStyle = '#06283a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 82 * s, y - 10 * s);
    ctx.lineTo(x + 92 * s, y - 10 * s);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#06283a';
    circle(ctx, x + 88 * s, y - 10 * s, 3.5);
  }
  // Shell.
  ctx.fillStyle = '#2f7d54';
  ellipse(ctx, x, y, 66 * s, 42 * s);
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x, y, 46 * s, 28 * s, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 46 * s, y);
  ctx.lineTo(x + 46 * s, y);
  ctx.moveTo(x, y - 28 * s);
  ctx.lineTo(x, y + 28 * s);
  ctx.stroke();
}

function drawRay(ctx, el, variant, t) {
  const s = el.size / 46;
  const x = el.x;
  const y = el.y + Math.sin(t * 1.1) * 5;
  ctx.fillStyle = '#8d99ae';
  ctx.beginPath();
  ctx.moveTo(x - 52 * s, y);
  ctx.quadraticCurveTo(x, y - 30 * s, x + 52 * s, y);
  ctx.quadraticCurveTo(x, y + 22 * s, x - 52 * s, y);
  ctx.fill();
  ctx.fillStyle = '#6c7a8c';
  circle(ctx, x + 14 * s, y - 4 * s, 3);
  ctx.strokeStyle = '#8d99ae';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 46 * s, y + 6 * s);
  ctx.quadraticCurveTo(x - 70 * s, y + 26 * s, x - 84 * s, y + 30 * s);
  ctx.stroke();
}

function drawAnemone(ctx, el, variant, t) {
  const s = scaleOf(el, variant);
  const size = el.size * s;
  const color = colorOf(el, variant);
  ctx.fillStyle = '#7a4a8f';
  ellipse(ctx, el.x, el.y, size * 0.7, size * 0.28);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < 11; i += 1) {
    const a = Math.PI + (i / 10) * Math.PI;
    const sway = Math.sin(t * 1.3 + i * 0.7) * 4;
    const tipX = el.x + Math.cos(a) * size * 0.75 + sway;
    const tipY = el.y - size * 0.55 + Math.sin(a) * size * 0.3;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(el.x + Math.cos(a) * size * 0.3, el.y - 4);
    ctx.lineTo(tipX, tipY);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    circle(ctx, tipX, tipY, 3);
  }
}

function drawWreck(ctx, el) {
  const { x, y, w, h } = el;
  ctx.fillStyle = '#6b4a2f';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y - 18);
  ctx.lineTo(x + w - 20, y + h * 0.55);
  ctx.lineTo(x + 16, y + h * 0.62);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 3;
  for (let i = 1; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 8, y + (h * i) / 4);
    ctx.lineTo(x + w - 8, y - 18 + (h * i) / 4 + 12);
    ctx.stroke();
  }
  // Broken mast.
  ctx.strokeStyle = '#5d3f27';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.55, y - 6);
  ctx.lineTo(x + w * 0.62, y - 92);
  ctx.stroke();
  // Torn sail.
  ctx.fillStyle = '#e8dcc3';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.62, y - 88);
  ctx.lineTo(x + w * 0.86, y - 62);
  ctx.lineTo(x + w * 0.64, y - 44);
  ctx.closePath();
  ctx.fill();
  // Portholes.
  ctx.fillStyle = '#ffd166';
  circle(ctx, x + w * 0.25, y + h * 0.22, 9);
  circle(ctx, x + w * 0.5, y + h * 0.18, 9);
  circle(ctx, x + w * 0.75, y + h * 0.14, 9);
}

function drawChest(ctx, el, variant) {
  const open = stateOf(el, variant);
  const s = el.size / 52;
  const x = el.x;
  const y = el.y;
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(x - 26 * s, y - 18 * s, 52 * s, 26 * s);
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(x - 26 * s, y - 4 * s, 52 * s, 4 * s);
  if (open) {
    ctx.fillStyle = '#8f5a2a';
    ctx.save();
    ctx.translate(x - 24 * s, y - 18 * s);
    ctx.rotate(-0.9);
    ctx.fillRect(0, -14 * s, 50 * s, 14 * s);
    ctx.restore();
    ctx.fillStyle = '#ffd166';
    circle(ctx, x - 8 * s, y - 22 * s, 7 * s);
    circle(ctx, x + 6 * s, y - 26 * s, 7 * s);
    circle(ctx, x + 16 * s, y - 20 * s, 6 * s);
  } else {
    ctx.fillStyle = '#8f5a2a';
    ctx.beginPath();
    ctx.arc(x, y - 18 * s, 26 * s, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(x - 4 * s, y - 22 * s, 8 * s, 12 * s);
  }
}

function drawOctopus(ctx, el, variant, t) {
  const s = el.size / 54;
  const arms = stateOf(el, variant) ? 7 : 8;
  const x = el.x;
  const y = el.y + Math.sin(t) * 4;
  ctx.strokeStyle = colorOf(el, variant);
  ctx.lineCap = 'round';
  for (let i = 0; i < arms; i += 1) {
    const a = (i / 7) * Math.PI * 1.4 + Math.PI * 0.8;
    const wave = Math.sin(t * 2 + i) * 8;
    ctx.lineWidth = 9 * s;
    ctx.beginPath();
    ctx.moveTo(x, y + 10 * s);
    ctx.quadraticCurveTo(
      x + Math.cos(a) * 26 * s,
      y + 34 * s + wave,
      x + Math.cos(a) * 38 * s,
      y + 52 * s - wave * 0.5,
    );
    ctx.stroke();
  }
  ctx.fillStyle = colorOf(el, variant);
  ctx.beginPath();
  ctx.arc(x, y, 30 * s, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ellipse(ctx, x, y - 2 * s, 30 * s, 22 * s);
  ctx.fillStyle = '#ffffff';
  circle(ctx, x - 11 * s, y - 8 * s, 7 * s);
  circle(ctx, x + 11 * s, y - 8 * s, 7 * s);
  ctx.fillStyle = '#06283a';
  circle(ctx, x - 11 * s, y - 8 * s, 3.5);
  circle(ctx, x + 11 * s, y - 8 * s, 3.5);
}

function drawAnchor(ctx, el, variant) {
  const dir = dirOf(el, variant);
  const s = el.size / 56;
  ctx.save();
  ctx.translate(el.x, el.y);
  ctx.scale(dir, 1);
  ctx.strokeStyle = '#5d6d7e';
  ctx.lineCap = 'round';
  ctx.lineWidth = 7 * s;
  ctx.beginPath();
  ctx.moveTo(0, -28 * s);
  ctx.lineTo(0, 22 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-20 * s, -16 * s);
  ctx.lineTo(20 * s, -16 * s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 22 * s, 16 * s, 0, Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, -32 * s, 6 * s, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawCoin(ctx, el) {
  ctx.fillStyle = '#ffd166';
  circle(ctx, el.x, el.y, el.size);
  ctx.fillStyle = '#b8860b';
  ctx.font = `bold ${el.size}px ${'system-ui, sans-serif'}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', el.x, el.y + 1);
}

function drawCrab(ctx, el) {
  const s = el.size / 22;
  ctx.fillStyle = '#ff6b4a';
  ellipse(ctx, el.x, el.y, 20 * s, 12 * s);
  circle(ctx, el.x - 22 * s, el.y - 8 * s, 7 * s);
  circle(ctx, el.x + 22 * s, el.y - 8 * s, 7 * s);
  ctx.fillStyle = '#06283a';
  circle(ctx, el.x - 6 * s, el.y - 4 * s, 2.5);
  circle(ctx, el.x + 6 * s, el.y - 4 * s, 2.5);
  ctx.strokeStyle = '#ff6b4a';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(el.x + i * 10 * s, el.y + 10 * s);
    ctx.lineTo(el.x + i * 14 * s, el.y + 20 * s);
    ctx.stroke();
  }
}

function drawJellyfish(ctx, el, variant, t) {
  const s = el.size * scaleOf(el, variant) / el.size;
  const size = el.size * scaleOf(el, variant);
  const drift = Math.sin(t * 0.7 + el.x * 0.03) * 6;
  const x = el.x + drift;
  const y = el.y + Math.sin(t * 0.5 + el.y) * 5;
  ctx.fillStyle = el.color;
  ctx.globalAlpha = 0.85;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.5, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = el.color;
  ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * size * 0.16, y + size * 0.1);
    ctx.quadraticCurveTo(
      x + i * size * 0.16 + Math.sin(t * 2 + i) * 6,
      y + size * 0.55,
      x + i * size * 0.2,
      y + size * 0.8,
    );
    ctx.stroke();
  }
  void s;
}

function drawAngler(ctx, el, variant, t) {
  const s = el.size / 84;
  const x = el.x;
  const y = el.y + Math.sin(t * 0.6) * 4;
  ctx.fillStyle = '#3a2e5c';
  ellipse(ctx, x, y, 44 * s, 38 * s);
  // Tail.
  ctx.beginPath();
  ctx.moveTo(x - 40 * s, y);
  ctx.lineTo(x - 62 * s, y - 16 * s);
  ctx.lineTo(x - 62 * s, y + 16 * s);
  ctx.closePath();
  ctx.fill();
  // Mouth with teeth.
  ctx.fillStyle = '#1c1433';
  ctx.beginPath();
  ctx.ellipse(x + 18 * s, y + 12 * s, 22 * s, 10 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 2 * s + i * 10 * s, y + 4 * s);
    ctx.lineTo(x + 6 * s + i * 10 * s, y + 12 * s);
    ctx.lineTo(x + 10 * s + i * 10 * s, y + 4 * s);
    ctx.closePath();
    ctx.fill();
  }
  // Eye.
  ctx.fillStyle = '#ffd166';
  circle(ctx, x + 16 * s, y - 12 * s, 5);
  ctx.fillStyle = '#06283a';
  circle(ctx, x + 16 * s, y - 12 * s, 2.5);
  // Lure: stalk + glowing bulb (its colour is the difference).
  ctx.strokeStyle = '#3a2e5c';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 4 * s, y - 30 * s);
  ctx.quadraticCurveTo(x + 26 * s, y - 52 * s, x + 40 * s, y - 48 * s);
  ctx.stroke();
  ctx.fillStyle = colorOf(el, variant);
  circle(ctx, x + 40 * s, y - 48 * s, 9);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  circle(ctx, x + 40 * s, y - 48 * s, 16 + Math.sin(t * 3) * 3);
  ctx.fillStyle = colorOf(el, variant);
  circle(ctx, x + 40 * s, y - 48 * s, 9);
}

function drawGlow(ctx, el, t) {
  const pulse = 3 + Math.sin(t * 2 + el.x) * 1.5;
  ctx.fillStyle = 'rgba(178, 255, 230, 0.35)';
  circle(ctx, el.x, el.y, el.r + pulse + 6);
  ctx.fillStyle = '#b2ffe6';
  circle(ctx, el.x, el.y, el.r);
}

function drawClam(ctx, el, variant) {
  const closed = stateOf(el, variant);
  const s = el.size / 54;
  ctx.fillStyle = '#c9b8f2';
  ctx.beginPath();
  ctx.ellipse(el.x, el.y, 30 * s, 16 * s, 0, 0, Math.PI);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(el.x, el.y + 4 * s, 30 * s, 12 * s, 0, 0, Math.PI);
  ctx.fill();
  if (!closed) {
    ctx.fillStyle = '#ffffff';
    circle(ctx, el.x, el.y - 4 * s, 9 * s);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    circle(ctx, el.x - 3 * s, el.y - 7 * s, 3 * s);
  }
}

function drawSeahorse(ctx, el, variant, t) {
  const s = el.size / 84;
  const x = el.x;
  const y = el.y + Math.sin(t * 0.9 + el.x) * 3;
  const color = colorOf(el, variant);
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineWidth = 13 * s;
  ctx.beginPath();
  ctx.moveTo(x, y + 34 * s);
  ctx.quadraticCurveTo(x - 22 * s, y + 10 * s, x - 6 * s, y - 14 * s);
  ctx.quadraticCurveTo(x + 4 * s, y - 28 * s, x + 16 * s, y - 30 * s);
  ctx.stroke();
  // Head + snout.
  ctx.fillStyle = color;
  ellipse(ctx, x + 20 * s, y - 32 * s, 12 * s, 9 * s);
  ctx.beginPath();
  ctx.moveTo(x + 28 * s, y - 34 * s);
  ctx.lineTo(x + 42 * s, y - 30 * s);
  ctx.lineTo(x + 28 * s, y - 26 * s);
  ctx.closePath();
  ctx.fill();
  // Crown spikes.
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * s;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + 12 * s + i * 6 * s, y - 40 * s);
    ctx.lineTo(x + 14 * s + i * 6 * s, y - 50 * s);
    ctx.stroke();
  }
  // Curled tail.
  ctx.beginPath();
  ctx.arc(x - 2 * s, y + 34 * s, 9 * s, 0, Math.PI * 1.5);
  ctx.stroke();
  // Dorsal fin.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.moveTo(x - 14 * s, y - 6 * s);
  ctx.lineTo(x - 26 * s, y + 2 * s);
  ctx.lineTo(x - 12 * s, y + 8 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#06283a';
  circle(ctx, x + 22 * s, y - 34 * s, 2.5);
}

function drawElement(ctx, el, variant, t) {
  if (!visible(el, variant)) return;
  switch (el.type) {
    case 'coral': drawCoral(ctx, el, variant); break;
    case 'seaweed': drawSeaweed(ctx, el, variant, t); break;
    case 'fish': drawFish(ctx, el, variant, t); break;
    case 'clownfish': drawClownfish(ctx, el, variant, t); break;
    case 'starfish': drawStarfish(ctx, el, variant); break;
    case 'shell': drawShell(ctx, el, variant); break;
    case 'bubble': drawBubble(ctx, el, variant, t); break;
    case 'rock': drawRock(ctx, el, variant); break;
    case 'turtle': drawTurtle(ctx, el, variant, t); break;
    case 'ray': drawRay(ctx, el, variant, t); break;
    case 'anemone': drawAnemone(ctx, el, variant, t); break;
    case 'wreck': drawWreck(ctx, el); break;
    case 'chest': drawChest(ctx, el, variant); break;
    case 'octopus': drawOctopus(ctx, el, variant, t); break;
    case 'anchor': drawAnchor(ctx, el, variant); break;
    case 'coin': drawCoin(ctx, el); break;
    case 'crab': drawCrab(ctx, el); break;
    case 'jellyfish': drawJellyfish(ctx, el, variant, t); break;
    case 'angler': drawAngler(ctx, el, variant, t); break;
    case 'glow': drawGlow(ctx, el, t); break;
    case 'clam': drawClam(ctx, el, variant); break;
    case 'seahorse': drawSeahorse(ctx, el, variant, t); break;
    default: break;
  }
}

/** Paint one whole picture into the current transform: panel-local 600x528. */
export function drawScene(ctx, scene, variant, t) {
  const w = PANEL.width;
  const h = PANEL.height;
  const sandY = 440;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, scene.water.top);
  grad.addColorStop(1, scene.water.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  // Light rays from the surface.
  const rand = createRandom(scene.seed);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  for (let i = 0; i < 5; i += 1) {
    const rx = rand() * w;
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + 60, 0);
    ctx.lineTo(rx + 10, sandY);
    ctx.lineTo(rx - 50, sandY);
    ctx.closePath();
    ctx.fill();
  }
  // Sand.
  ctx.fillStyle = scene.sand;
  ctx.beginPath();
  ctx.moveTo(0, sandY);
  ctx.quadraticCurveTo(w * 0.3, sandY - 14, w * 0.6, sandY);
  ctx.quadraticCurveTo(w * 0.85, sandY + 10, w, sandY - 4);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  // Pebbles, seeded so both panels match.
  ctx.fillStyle = 'rgba(6, 40, 58, 0.18)';
  for (let i = 0; i < 14; i += 1) {
    circle(ctx, rand() * w, sandY + 12 + rand() * (h - sandY - 20), 3 + rand() * 5);
  }
  for (const el of scene.elements) drawElement(ctx, el, variant, t);
  // Soft vignette so the picture reads as one framed scene.
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.85);
  vig.addColorStop(0, 'rgba(4, 16, 31, 0)');
  vig.addColorStop(1, 'rgba(4, 16, 31, 0.28)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}
