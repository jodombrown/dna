/**
 * AppShell — Frame 01, the desktop chrome contract.
 *
 * Four regions, one shell:
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
 * The shell owns height. There is no `min-h-screen` in this file: the desktop
 * grid is sized to the viewport below the chrome and each column scrolls
 * independently, exactly like ThreeColumnLayout.
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
import { useIdentitySheetSafe } from '@/components/ui/settings-kit';
import { useMobile } from '@/hooks/useMobile';

/** The content column is capped with the rails at a 1400px total (px, so the
 *  gate never sees a bracketed arbitrary value; matches ThreeColumnLayout). */
const CONTENT_MAX_WIDTH = 1400;
const LEFT_RAIL = '280px';
const RIGHT_RAIL = '340px';

interface AppShellProps {
  /** Left rail (280). Surface CONTEXT only — filters, an index, the member's
   *  own object. Never navigation. The track drops when this is absent. */
  context?: React.ReactNode;
  /** Content column (1fr). A surface's LensBar is the first node here. */
  children: React.ReactNode;
  /** Right rail (340). The track drops entirely when this is absent — the grid
   *  never reserves an empty 340. */
  related?: React.ReactNode;
}

export function AppShell({ context, children, related }: AppShellProps) {
  const inPanel = useIdentitySheetSafe() !== null;
  const { isMobile } = useMobile();

  // ── Panel context ────────────────────────────────────────────────────────
  // The shell owns everything route-only; a panel is content only. Rendering
  // any of the route-only set here is the DR0 defect class (BD135 rule 5).
  if (inPanel) {
    return <>{children}</>;
  }

  // ── Mobile (<768px) ──────────────────────────────────────────────────────
  // header + composer bubble + content + PulseDock, unchanged. The composer
  // bubble is part of the mobile header; PulseBar self-nulls on mobile so the
  // desktop C-nav track never appears here. The shell owns height, so no
  // min-h-screen — the spacer clears the fixed header and content flows.
  if (isMobile) {
    return (
      <>
        <UnifiedHeader />
        <div
          aria-hidden
          style={{ height: 'var(--total-header-height, 7.5rem)' }}
        />
        <div className="w-full max-w-full overflow-x-hidden pb-20">{children}</div>
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
