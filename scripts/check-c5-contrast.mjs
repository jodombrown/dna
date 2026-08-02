#!/usr/bin/env node
// Verifies the D092 contrast invariants against src/index.css.
// Load-bearing because three dark text values sit within 0.03 of the 4.5 floor.
import { readFileSync } from 'node:fs';

const css = readFileSync('src/index.css', 'utf8');

// A declaration's meaning is decided by the cascade, so take the LAST
// declaration inside the given block, not the first.
function lastDecl(block, name) {
  const re = new RegExp(`--${name}\\s*:\\s*([0-9.]+)\\s+([0-9.]+)%\\s+([0-9.]+)%`, 'g');
  let m, hit = null;
  while ((m = re.exec(block)) !== null) hit = [+m[1], +m[2], +m[3]];
  return hit;
}
function blocks(src) {
  const darkAt = src.indexOf('.dark {');
  if (darkAt < 0) throw new Error('no .dark block found');
  return { light: src.slice(0, darkAt), dark: src.slice(darkAt) };
}
function toRgb([h, s, l]) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map(v => Math.round(v * 255));
}
function lum(rgb) {
  const c = rgb.map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

const CS = ['connect', 'convene', 'collaborate', 'contribute', 'convey'];
const b = blocks(css);
let failed = false;

for (const theme of ['light', 'dark']) {
  const block = b[theme];
  const card = lastDecl(block, 'card');
  if (!card) { console.error(`::error::--card not resolvable in ${theme}`); failed = true; continue; }

  for (const c of CS) {
    // The slot is declared as var(--c5-<c>-<rung>); resolve one hop.
    const slotRe = new RegExp(`--c5-${c}-text\\s*:\\s*([^;]+);`, 'g');
    let m, raw = null;
    while ((m = slotRe.exec(block)) !== null) raw = m[1].trim();
    if (!raw) { console.error(`::error::--c5-${c}-text missing in ${theme}`); failed = true; continue; }

    let hsl;
    const v = raw.match(/var\(\s*--(c5-[a-z0-9-]+)\s*\)/);
    if (v) hsl = lastDecl(b.light, v[1]);           // ramp rungs live in :root only
    else {
      const t = raw.match(/([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%/);
      if (t) hsl = [+t[1], +t[2], +t[3]];
    }
    if (!hsl) { console.error(`::error::could not resolve --c5-${c}-text in ${theme} (raw: ${raw})`); failed = true; continue; }

    const r = ratio(toRgb(hsl), toRgb(card));
    const ok = r >= 4.5;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${theme.padEnd(5)} ${c.padEnd(12)} text vs --card  ${r.toFixed(2)}`);
    if (!ok) {
      console.error(`::error::${theme} --c5-${c}-text is ${r.toFixed(2)} against --card, below the 4.5 floor (D092).`);
      failed = true;
    }
  }
}

if (failed) { console.error('\nD092 contrast invariant FAILED. See the amendment on D092 before changing --card.'); process.exit(1); }
console.log('\nD092 contrast invariants hold.');
