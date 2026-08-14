/**
 * SectionNav: route-driven navigation for panes inside ONE subject, never a
 * corpus switch. No track, no fill, no container — a hairline baseline the
 * full width, active marked by a 2px rule and a weight change. Labels always
 * visible. Cannot be mistaken for a Lens Bar because it has no box. See S16
 * (BD388 pack).
 *
 * BD556 keeps that treatment untouched. The row's VERTICAL pinning is owned by
 * the element that places this one (EventManageDesktopNav on desktop, the fixed
 * header on mobile), never by this file — nothing here may grow a track, a
 * fill, a background or a box. The one thing this file does own is the
 * horizontal scroll position of its own `overflow-x-auto` row, below.
 */
import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SectionNavItem = {
  label: string;
  path: string; // relative, matches the nested route's own path segment
  icon: LucideIcon;
  roles: string[];
};

interface SectionNavProps {
  items: SectionNavItem[];
  userRole: string;
}

export function SectionNav({ items, userRole }: SectionNavProps) {
  const visible = items.filter((item) => userRole === 'manager' || item.roles.includes(userRole));
  const navRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  /*
   * BD556, second half: keep the ACTIVE tab in view when the route changes.
   *
   * The row is `overflow-x-auto` and measures 790px against a 328-720px
   * viewport below 1024, so it genuinely scrolls there (at 1024+ it fits
   * exactly and cannot move at all). Nothing controlled that scroll offset
   * before: the <nav> is not remounted between panes, so scrollLeft simply
   * persisted, and a deep link or a back/forward into a late pane left its own
   * tab parked off-screen. What movement there was came from the browser
   * scrolling a focused link into view — which does not happen on a route
   * change that did not originate from a click.
   *
   * scrollLeft, deliberately, and NOT scrollIntoView: scrollIntoView also acts
   * on the block axis, so it could yank the PAGE vertically on a route change —
   * reintroducing the exact defect the pinning above just fixed. This touches
   * one axis and one element.
   *
   * The bounds check makes it a no-op whenever the active tab is already fully
   * visible, so a row that fits never moves. Ruled out as a cause first: the
   * active tab's font-medium was measured against real Inter 400/500 at
   * 1px of width change, which shifts nothing perceptible.
   */
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active) return;
    const row = nav.getBoundingClientRect();
    const tab = active.getBoundingClientRect();
    if (tab.left < row.left) nav.scrollLeft -= row.left - tab.left;
    else if (tab.right > row.right) nav.scrollLeft += tab.right - row.right;
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      aria-label="Event sections"
      className="flex items-center gap-1 overflow-x-auto border-b border-border"
    >
      {visible.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === ''}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-body whitespace-nowrap border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-foreground text-foreground font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )
          }
        >
          <item.icon className="h-4 w-4" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
