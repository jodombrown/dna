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
 *   content  — the `children` column (1fr). When `tabs` is absent, a surface's
 *              LensBar sits at the TOP of this column, rendered as the first
 *              node of `children` by the surface itself. When `tabs` IS
 *              supplied, it owns the lens bar instead (see `tabs` below) and
 *              `children` starts at content — AppShell changes no nav slot and
 *              converts no C surface, it only supplies the column.
 *   right    — the `related` rail (340). Renders nothing, and the grid DROPS
 *              the track, when `related` is absent OR the viewport is in the
 *              768–1023 tablet band — there is never an empty 340. Pack 14
 *              S68: tablet takes desktop's arrangement and drops the sidebar,
 *              it does not get three fixed rails jammed into 768px.
 *   tabs     — optional. Per BD458, the lens bar for hubs that have one lives
 *              here instead of as the first node of `children`, so it sits in
 *              the fixed, scroll-collapsing top treatment on mobile rather
 *              than scrolling away with the content. Desktop renders it ABOVE
 *              the content column, spanning the content track only — never
 *              the rails, which is the content's neighbour, not its
 *              container.
 *
 * Mobile (<768px): the shell renders DnaMobileHubShell's header treatment (the
 * canonical logo / bubble / bell / avatar top bar with its BD157 safe-area
 * inset) plus PulseDock — reused, not re-implemented. `tabs`, when supplied,
 * passes straight through to DnaMobileHubShell's own `tabs` slot. The rails
 * fold beneath the well: content first (LensBar is its first node when `tabs`
 * is absent), then `context`, then `related`.
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

/**
 * READING_MAX_WIDTH — a reading-width cap for PROSE CONTENT, not a shell cap.
 *
 * This used to be CONTENT_MAX_WIDTH, applied to the whole shell grid — rails
 * included. That conflated a reading-width limit (right for a column of
 * prose) with a viewport cap (wrong for a shell with fixed rails): on a wide
 * viewport the rails held their width and the content column absorbed the
 * entire loss, down to 708px of a 2543px viewport.
 *
 * The shell no longer caps anything; it fills the viewport. This constant
 * moved to where reading-width limits belong: inside a content column,
 * applied by the surface that owns that column, only when that surface's
 * content is prose-like. A card grid must NOT apply this — more width there
 * means more columns, not a fixed reading column with dead space beside it.
 */
export const READING_MAX_WIDTH = 1400;
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
  /** Content column (1fr). When `tabs` is absent, a surface's LensBar is the
   *  first node here. When `tabs` is supplied, it owns the lens bar and
   *  `children` starts at content. */
  children: React.ReactNode;
  /** Right rail (340). The track drops entirely when this is absent, or when
   *  the viewport is in the 768-1023 tablet band — the grid never reserves an
   *  empty 340. */
  related?: React.ReactNode;
  /** The hub's lens bar (BD458). Mobile: passed straight through to
   *  DnaMobileHubShell's `tabs` slot, in the fixed top treatment. Desktop:
   *  rendered above the content column, spanning the content track only.
   *  Absent renders nothing — no reserved space. */
  tabs?: React.ReactNode;
}

export function AppShell({ bubble, context, children, related, tabs }: AppShellProps) {
  const inPanel = useIdentitySheetSafe() !== null;
  const { isMobile, isTablet } = useMobile();
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
        <DnaMobileHubShell bubble={bubble} tabs={tabs}>
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
  // The left track is present only when `context` is. The right track is
  // present only when `related` is supplied AND the viewport is 1024+ — the
  // 768-1023 tablet band takes desktop's arrangement minus the sidebar (Pack
  // 14 S68), so `related` never renders there even if the surface supplied
  // it. `1fr` is always the content column, and the shell carries no width
  // cap of its own — it fills the viewport (see READING_MAX_WIDTH above).
  const hasContext = context != null;
  const hasRelated = related != null && !isTablet;
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
        className="grid w-full gap-5 px-4"
        style={{
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

        <main className="flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {tabs}
          <div
            id="main-content"
            tabIndex={-1}
            data-scroll-container="main"
            className="flex-1 overflow-y-auto scrollbar-thin focus:outline-none"
          >
            {children}
          </div>
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
