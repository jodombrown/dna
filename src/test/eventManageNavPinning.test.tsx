/**
 * BD556 — the event-management tab row stays put, and stays box-less.
 *
 * ── Why this reads source ─────────────────────────────────────────────────
 * jsdom does no layout: every getBoundingClientRect is 0, `position: sticky`
 * is never resolved, and a rendered assertion here would pass against a nav
 * that scrolls away exactly as it does against one that pins. That is BD141's
 * vacuous green, and this file's sibling `appChromeSafeArea.test.tsx` already
 * names the same limit for the same reason. The behavioural certification is
 * Chromium (recorded in the PR) plus founder QA. What a source read CAN hold
 * is the two structural preconditions the fix rests on — both of which are
 * silent when broken, which is precisely what makes them worth a gate.
 *
 * ── Precondition 1: a sticky box needs a scrollport AND room to travel ────
 * `position: sticky` on the <nav> alone is INERT on this route, twice over:
 * its containing block used to be a wrapper exactly as tall as itself, and
 * `overflow-x: hidden` on html/body/#root/BaseLayout makes each of those a
 * scroll container that never scrolls, so nothing above it offers a scrollport
 * either. EventManageDesktopNav therefore has to own a real scrolling region
 * AND hold the panes inside it. Delete either half and the row silently goes
 * back to scrolling away — no error, no failing render, just the defect back.
 *
 * ── Precondition 2: the row must stay box-less (S16/BD388) ───────────────
 * SectionNav must never look like the Lens Bar. Pinning it is exactly the kind
 * of change that tempts a background, a shadow or a rounded track onto the nav
 * itself. The opaque backing belongs to the wrapper, not the row.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../..');
const read = (rel: string) => readFileSync(resolve(repoRoot, rel), 'utf8');
/** Comments are prose, not code — this repo has matched prose as code before. */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const NAV = 'src/components/convene/EventManageDesktopNav.tsx';
const SECTION_NAV = 'src/components/shell/SectionNav.tsx';
const EVENT_DETAIL = 'src/pages/dna/convene/EventDetail.tsx';

describe('BD556 — EventManageDesktopNav pins the manage tabs', () => {
  const nav = strip(read(NAV));

  it('owns a scrolling region sized off the live header token', () => {
    expect(nav).toMatch(/overflow-y-auto/);
    // --total-header-height (fallback 7.5rem) is the header + PulseBar sum in
    // index.css. A hardcoded px height here would drift the moment either bar
    // is remeasured, which is the drift BD361 removed everywhere else.
    expect(nav).toMatch(/calc\(100dvh\s*-\s*var\(--total-header-height,\s*7\.5rem\)\)/);
  });

  it('pins the row inside that region', () => {
    expect(nav).toMatch(/\bsticky\b/);
    // Opaque backing is required once panes pass underneath.
    expect(nav).toMatch(/bg-background/);
  });

  it('renders the panes INSIDE the scrolling region, not beside it', () => {
    // The whole defect was that the row and the content it should pin above
    // were siblings, leaving the row no containing block to travel inside.
    expect(nav).toMatch(/\{children\}/);
    expect(strip(read(EVENT_DETAIL))).toMatch(
      /<EventManageDesktopNav[\s\S]*?>[\s\S]*?\{mainContent\}[\s\S]*?<\/EventManageDesktopNav>/,
    );
  });

  it('reads the header offset from a style object, never bracket syntax', () => {
    // CLAUDE.md hard prohibition 2 bans bracket values in src/, and PulseBar +
    // MobileFeedView already read header tokens exactly this way. Both files
    // are checked: `top-[var(--total-header-height,7.5rem)]` on the <nav> is
    // the specific wrong turn this change was closest to taking.
    for (const file of [NAV, SECTION_NAV]) {
      expect({ file, brackets: strip(read(file)).match(/\b[a-z-]+-\[/g) ?? [] }).toEqual({
        file,
        brackets: [],
      });
    }
  });
});

describe('S16/BD388 — SectionNav stays box-less through the pinning change', () => {
  const sectionNav = strip(read(SECTION_NAV));
  /** The <nav>'s own class list, which is the surface that must not grow a box. */
  const navClasses = sectionNav.match(/className="([^"]*border-b border-border[^"]*)"/)?.[1] ?? '';

  it('the nav element still declares the hairline baseline and nothing more', () => {
    expect(navClasses).toContain('border-b');
    expect(navClasses).toContain('border-border');
  });

  it('grows no track, fill, box or shadow', () => {
    const boxy = ['bg-', 'shadow', 'rounded', 'ring-', 'backdrop-'];
    expect(boxy.filter((c) => navClasses.includes(c))).toEqual([]);
  });

  it('does not pin itself — placement belongs to whatever renders it', () => {
    // Mobile rides DnaMobileHubShell's fixed header; desktop rides
    // EventManageDesktopNav. A sticky/fixed here would be inert on both.
    expect(navClasses).not.toMatch(/\b(sticky|fixed)\b/);
  });

  it('keeps the active tab in view without touching the block axis', () => {
    // scrollIntoView would also scroll the PAGE vertically on a route change,
    // reintroducing the exact movement BD556 just removed.
    expect(sectionNav).toMatch(/scrollLeft/);
    expect(sectionNav).not.toMatch(/scrollIntoView/);
  });
});
