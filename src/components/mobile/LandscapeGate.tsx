/**
 * LandscapeGate (BD158) — the honest notice that landscape is unbuilt.
 *
 * This is a SCOPE CUT wearing a feature's clothes. Landscape layout is
 * unfinished at v0.0 and we are choosing not to finish it, so we say so plainly
 * instead of letting a member discover it as breakage. When landscape gets
 * built, this component is deleted rather than configured.
 *
 * ── The media query is the whole risk ──────────────────────────────────────
 * A bare `(orientation: landscape)` matches EVERY DESKTOP MONITOR. Shipped
 * unscoped it would blur the entire web app behind a rotate-your-phone message
 * for every desktop member. The height bound is what makes this a phone rule:
 * a phone on its side is short, a desktop and an iPad in landscape are not.
 *
 * Do not relax `max-height` without re-testing an iPad in landscape, which is a
 * legitimate way to use DNA and must never be caught.
 *
 * ── Dismissible, deliberately (WCAG 2.1 SC 1.3.4, Level AA) ────────────────
 * Content must not restrict its view to a single orientation unless that
 * orientation is essential. Ours is not essential, it is unfinished, and the
 * people most likely to need landscape are the ones least able to choose it:
 * mounted devices, wheelchair mounts, assistive rigs where the phone's
 * orientation is not the member's to set. Almost everyone will rotate. The few
 * who cannot are not locked out of the platform built for their return.
 *
 * The dismissal is per-rotation on purpose. Rotating back to portrait and
 * returning to landscape shows the notice again, because the second visit is
 * usually a different member on a shared device or a different intent, and a
 * remembered dismissal would silently hide a known-broken layout forever.
 */

import * as React from 'react';

/**
 * A phone on its side. Not a desktop, not an iPad.
 *
 * Kept as the size bound and as the last-resort fallback where no orientation
 * API exists. It is NOT trusted alone: both halves measure the LAYOUT viewport,
 * which the software keyboard shrinks. A 402x725 phone with the keyboard open
 * reports roughly 402x300, which is wider than tall and under the height bound,
 * so CSS calls a vertical phone "landscape". That false positive is what made
 * this notice flash at a member mid-signup.
 */
const PHONE_LANDSCAPE = '(orientation: landscape) and (max-height: 500px)';

/**
 * Above every band in the app, including alert-dialog.
 *
 * Written as a constant and applied inline, matching `DRAWER_Z_INDEX` in
 * `components/drawer/constants.ts`, because `tailwind.config.ts` declares no
 * `zIndex` scale: a `z-*` utility beyond Tailwind's defaults renders NOTHING.
 * The bands, per that file: sheet 999/1000, drawer 1060, alert-dialog 1100.
 */
const LANDSCAPE_GATE_Z_INDEX = 1200;

/** Under this many CSS px of lost visual viewport, the keyboard is up. */
const KEYBOARD_THRESHOLD = 150;

/** Is the DEVICE on its side? The keyboard cannot change this. */
function isDeviceLandscape(): boolean {
  if (typeof window === 'undefined') return false;

  const type = window.screen?.orientation?.type;
  if (typeof type === 'string') return type.startsWith('landscape');

  const angle = (window as Window & { orientation?: number }).orientation;
  if (typeof angle === 'number') return Math.abs(angle) === 90;

  // No orientation API: fall back to the media query, keyboard risk and all.
  return window.matchMedia?.(PHONE_LANDSCAPE).matches ?? false;
}

/** Second, independent guard: never interrupt someone who is typing. */
function isKeyboardOpen(): boolean {
  if (typeof window === 'undefined') return false;

  const vv = window.visualViewport;
  const shrunk = vv ? window.innerHeight - vv.height > KEYBOARD_THRESHOLD : false;
  if (!shrunk) return false;

  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable;
}

/** A phone, on its side, with nobody typing. */
function shouldGate(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  const shortEnough = window.matchMedia(PHONE_LANDSCAPE).matches;
  return shortEnough && isDeviceLandscape() && !isKeyboardOpen();
}

export function LandscapeGate() {
  const [isPhoneLandscape, setIsPhoneLandscape] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(PHONE_LANDSCAPE);

    const evaluate = () => setIsPhoneLandscape(shouldGate());

    // Only a real device rotation rearms the notice. Rearming on every media
    // query flip is what turned one keyboard open into a repeating loop.
    const onRotate = () => {
      setDismissed(false);
      evaluate();
    };

    evaluate();
    mq.addEventListener('change', evaluate);
    window.screen?.orientation?.addEventListener?.('change', onRotate);
    window.visualViewport?.addEventListener('resize', evaluate);
    document.addEventListener('focusin', evaluate);
    document.addEventListener('focusout', evaluate);

    return () => {
      mq.removeEventListener('change', evaluate);
      window.screen?.orientation?.removeEventListener?.('change', onRotate);
      window.visualViewport?.removeEventListener('resize', evaluate);
      document.removeEventListener('focusin', evaluate);
      document.removeEventListener('focusout', evaluate);
    };
  }, []);


  if (!isPhoneLandscape || dismissed) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="landscape-gate-title"
      style={{ zIndex: LANDSCAPE_GATE_Z_INDEX }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-background/80 px-6 text-center backdrop-blur-md"
    >
      <h2 id="landscape-gate-title" className="text-h3 text-foreground">
        Turn your phone upright.
      </h2>
      <p className="text-body text-muted-foreground">DNA is built for portrait.</p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        // `min-h-11` is 44px, the iOS minimum target. NOT `min-h-touch`: that
        // token is live at five sites on main and does not exist in the config.
        className="min-h-11 rounded-full px-4 text-meta text-muted-foreground underline hover:text-foreground"
      >
        Continue anyway
      </button>
    </div>
  );
}

export default LandscapeGate;
