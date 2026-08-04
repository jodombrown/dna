/**
 * AppShell — Frame 01, the chrome contract at both widths.
 *
 * The shell is the ONE chrome owner (BD110) for the routes that mount it: it
 * renders the header and the C nav itself, and claims ownership so BaseLayout's
 * global chrome stands down (see ChromeOwnerContext). A route on AppShell never
 * double-renders chrome and — the defect this frame repairs — never renders
 * none.
 *
 * Desktop (>=768px), four regions in one grid:
 *   header   — <UnifiedHeader />, full width, height var(--unified-header-height)
 *   C nav    — <PulseBar />, full width, fixed directly under the header at
 *              top: var(--unified-header-height) (PulseBar owns that positioning;
 *              it is rendered unchanged)
 *   left     — the `context` rail (280): filters, an index, the member's own
 *              object. Surface CONTEXT only, NEVER navigation.
 *   content  — the `children` column (1fr). A surface's LensBar sits at the TOP
 *              of this column, rendered as the first node of `children` by the
 *              surface itself — AppShell changes no nav slot and converts no C
 *              surface, it only supplies the column.
 *   right    — the `related` rail (340). Renders nothing when `related` is
 *              absent and the grid DROPS the track — there is never an empty 340.
 *
 * Mobile (<768px): the shell renders DnaMobileHubShell's header treatment (the
 * canonical logo / bubble / bell / avatar top bar with its BD157 safe-area
 * inset) plus PulseDock — reused, not re-implemented. The rails fold beneath the
 * well: content first (LensBar is its first node), then `context`, then
 * `related`.
 *
 * The shell owns height. There is no `min-h-screen` in this file's DESKTOP grid;
 * the mobile branch delegates height to DnaMobileHubShell, which owns it there.
 *
 * Panel-awareness (BD135 rule 5, the same contract PageFrame encodes): inside a
 * 448px drawer panel the shell already owns the header, back, close, the scroll
 * container and the safe-area inset. AppShell therefore renders NONE of the
 * route-only set in a panel — no mark, Home, search, C nav, Compose, DIA, bell,
 * avatar, page-level back/breadcrumb, page-width container, and no min-h-screen.
 * `useIdentitySheetSafe()` is the detector: it is non-null only inside a panel.
 * Surface actions live inside `children` and so render in both contexts.
 */

import * as React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PulseBar, PulseDock } from '@/components/pulse';
import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';
import type { DnaMobileHeaderBubble } from '@/components/mobile/DnaMobileHeader';
import { useIdentitySheetSafe } from '@/components/ui/settings-kit';
import { useChromeOwner } from '@/layouts/ChromeOwnerContext';
import { useMobile } from '@/hooks/useMobile';

/** The content column is capped with the rails at a 1400px total (px, so the
 *  gate never sees a bracketed arbitrary value; matches ThreeColumnLayout). */
const CONTENT_MAX_WIDTH = 1400;
const LEFT_RAIL = '280px';
const RIGHT_RAIL = '340px';

interface AppShellProps {
  /** The mobile header's action bubble (search/composer/static). The shell owns
   *  the mobile chrome (BD110), so the surface hands it the ONE thing that
   *  differs per surface. Required — a mobile header with no bubble is a
   *  half-rendered header, which is the defect this frame repairs. */
  bubble: DnaMobileHeaderBubble;
  /** Left rail (280). Surface CONTEXT only — filters, an index, the member's
   *  own object. Never navigation. The track drops when this is absent. */
  context?: React.ReactNode;
  /** Content column (1fr). A surface's LensBar is the first node here. */
  children: React.ReactNode;
  /** Right rail (340). The track drops entirely when this is absent — the grid
   *  never reserves an empty 340. */
  related?: React.ReactNode;
}

export function AppShell({ bubble, context, children, related }: AppShellProps) {
  const inPanel = useIdentitySheetSafe() !== null;
  const { isMobile } = useMobile();
  const { claim, release } = useChromeOwner();

  // ── Chrome ownership (BD110) ──────────────────────────────────────────────
  // Claim before the browser paints, release on unmount. useLayoutEffect (not
  // useEffect) is the whole reason there is no flash: BaseLayout renders its
  // chrome on the first commit, this fires synchronously before paint, and the
  // re-render with our chrome lands in the same frame. A panel is an overlay
  // ON TOP of a route — the route beneath keeps its chrome — so a panelled
  // AppShell claims nothing.
  React.useLayoutEffect(() => {
    if (inPanel) return;
    claim();
    return release;
  }, [inPanel, claim, release]);

  // ── Panel context ────────────────────────────────────────────────────────
  // The shell owns everything route-only; a panel is content only. Rendering
  // any of the route-only set here is the DR0 defect class (BD135 rule 5).
  if (inPanel) {
    return <>{children}</>;
  }

  // ── Mobile (<768px) ──────────────────────────────────────────────────────
  // The shell renders the CANONICAL mobile chrome (BD110): DnaMobileHubShell's
  // header treatment — logo / bubble / bell / avatar in the fixed, safe-area-
  // inset, scroll-collapsing top bar (BD157) — reused, never re-implemented,
  // plus PulseDock. This branch renders NO UnifiedHeader; UnifiedHeader used to
  // self-hide on these paths and left mobile Connect with no header at all.
  //
  // The rails cannot be side columns at this width, so they FOLD BENEATH the
  // well (Frame 01): the content (`children`, whose first node is the surface's
  // LensBar) comes first, then `context`, then `related`. The lens bar is the
  // first thing under the header at 390. The tracks only DROP when the surface
  // omits them, never because the viewport is narrow.
  if (isMobile) {
    return (
      <>
        <DnaMobileHubShell bubble={bubble}>
          {children}
          {context != null && (
            <div className="border-t border-border/40">{context}</div>
          )}
          {related != null && (
            <div className="border-t border-border/40">{related}</div>
          )}
        </DnaMobileHubShell>
        <PulseDock />
      </>
    );
  }

  // ── Desktop (>=768px) ────────────────────────────────────────────────────
  // The right track is present only when `related` is; the left track only when
  // `context` is. `1fr` is always the content column. Dynamic grid template ->
  // an inline style (rule 7), the same call ThreeColumnLayout makes.
  const hasContext = context != null;
  const hasRelated = related != null;
  const gridTemplateColumns = [
    hasContext ? LEFT_RAIL : null,
    '1fr',
    hasRelated ? RIGHT_RAIL : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <UnifiedHeader />
      <PulseBar />
      <div
        className="mx-auto grid w-full gap-5 px-4"
        style={{
          maxWidth: CONTENT_MAX_WIDTH,
          gridTemplateColumns,
          // Clear the fixed header + C nav, then own the remaining viewport.
          // Margin sits OUTSIDE the box, so the grid height is not reduced a
          // second time by the chrome under border-box (paddingTop would be).
          marginTop: 'var(--total-header-height, 7.5rem)',
          height: 'calc(100dvh - var(--total-header-height, 7.5rem))',
        }}
      >
        {hasContext && (
          <aside className="overflow-y-auto scrollbar-thin" style={{ minWidth: 0 }}>
            {context}
          </aside>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          data-scroll-container="main"
          className="overflow-y-auto scrollbar-thin focus:outline-none"
          style={{ minWidth: 0 }}
        >
          {children}
        </main>

        {hasRelated && (
          <aside className="overflow-y-auto scrollbar-thin" style={{ minWidth: 0 }}>
            {related}
          </aside>
        )}
      </div>
    </>
  );
}

export default AppShell;
