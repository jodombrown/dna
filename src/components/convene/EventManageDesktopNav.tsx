/**
 * EventManageDesktopNav — the desktop/tablet counterpart to the manage tabs
 * DnaMobileHubShell renders in its fixed mobile header. DnaMobileHubShell
 * drops the `tabs` prop entirely above the mobile breakpoint ("if (!isMobile)
 * return children" — its own doc comment says "page keeps its own desktop
 * chrome"), so EventDetail renders this in its place. Lives in
 * src/components (not src/pages) so it, not the page, owns the width
 * container — same rule the six management panes already follow. BD508/BD509.
 *
 * ── BD556: this element also owns the PINNING, and SectionNav is untouched ──
 *
 * SectionNav owns appearance and nothing else (S16/BD388: no track, no fill, no
 * box, never mistakable for a Lens Bar). This owns placement — the same split
 * BD508/BD509 already drew for width. Nothing below adds a track or a box to
 * the row; the row renders exactly as it did.
 *
 * `sticky` on the <nav> itself was tried first and MEASURED INERT, for two
 * independent reasons, either of which alone is fatal:
 *
 *  1. A sticky box can only travel inside its containing block, and the <nav>'s
 *     containing block was this wrapper — a div exactly as tall as the <nav>.
 *     Zero room to travel, so it scrolled away with the page.
 *  2. Nothing on this route had a scrollport for it to stick TO. `overflow-x:
 *     hidden` forces the other axis to compute `auto`, which makes a box a
 *     scroll container; index.css sets it on `html`, `body` and `#root`, and
 *     BaseLayout sets it again on its page wrapper. Each is a scroll container
 *     that never actually scrolls — they grow with their content while the
 *     DOCUMENT scrolls — so their scrollTop is pinned at 0 and any sticky
 *     descendant degrades to a no-op. Verified in Chromium: sticky anywhere
 *     under that chain does not stick.
 *
 * Relaxing those four `overflow-x` declarations globally would fix it and was
 * REJECTED: it is a whole-app change that would silently wake every dormant
 * `sticky` in the codebase at once (EventOverview's CTA banner and its desktop
 * sidebar, SettingsLayout's rail, RightWidgets, FeedStoryDetail…), most of them
 * written against `top` offsets that predate the current chrome heights. That
 * is a system ruling and a sweep, not this fix.
 *
 * So the scrollport is created HERE, scoped to this route, using the pattern
 * five layouts in this repo already use (AppShell, DetailViewLayout,
 * TwoColumnLayout, ThreeColumnLayout, FullCanvasLayout all size a scrolling
 * region as `calc(100dvh - var(--total-header-height, 7.5rem))`). BaseLayout's
 * spacer above already reserves exactly --total-header-height, so spacer +
 * this region = 100dvh and the document itself stops scrolling on this route.
 *
 * --total-header-height (fallback 7.5rem) is the live token for header +
 * PulseBar, defined in index.css and read by eight other call sites; both bars
 * sit above this row, so it is the correct one. It is read from a style object
 * rather than `top-[var(--total-header-height,7.5rem)]` because bracket syntax
 * is banned in src/ (CLAUDE.md hard prohibition 2) and every other pinned
 * surface here already reads header tokens this way — PulseBar and
 * MobileFeedView both do `style={{ top: 'var(--unified-header-height, 56px)' }}`.
 *
 * Inside the region the row pins at `top-0`, since the region already begins
 * below the chrome. pt-6 is inside the sticky box, so the row sits at the same
 * offset pinned as at rest: it does not move at all, in either state.
 *
 * bg-background is load-bearing now that panes pass underneath, not a change of
 * visual heart — it is the same page ground the row already sat on. It spans
 * max-w-5xl, the identical container all six management panes use, so nothing
 * scrolls through beside it.
 */
import type { ReactNode } from 'react';
import { SectionNav, type SectionNavItem } from '@/components/shell/SectionNav';

interface EventManageDesktopNavProps {
  items: SectionNavItem[];
  userRole: string;
  /** The management panes. They live INSIDE the scrolling region so the tab
   *  row has something to stay pinned across; as siblings, it had nothing. */
  children: ReactNode;
}

export function EventManageDesktopNav({ items, userRole, children }: EventManageDesktopNavProps) {
  return (
    <div
      data-scroll-container="event-manage"
      className="overflow-y-auto overflow-x-hidden"
      style={{ height: 'calc(100dvh - var(--total-header-height, 7.5rem))' }}
    >
      <div className="sticky top-0 z-10 bg-background max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <SectionNav items={items} userRole={userRole} />
      </div>
      {children}
    </div>
  );
}

export default EventManageDesktopNav;
