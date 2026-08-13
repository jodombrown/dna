/**
 * EventManageDesktopNav — the desktop/tablet counterpart to the manage tabs
 * DnaMobileHubShell renders in its fixed mobile header. DnaMobileHubShell
 * drops the `tabs` prop entirely above the mobile breakpoint ("if (!isMobile)
 * return children" — its own doc comment says "page keeps its own desktop
 * chrome"), so EventDetail renders this in its place. Lives in
 * src/components (not src/pages) so it, not the page, owns the width
 * container — same rule the six management panes already follow. BD508/BD509.
 */
import { SectionNav, type SectionNavItem } from '@/components/shell/SectionNav';

interface EventManageDesktopNavProps {
  items: SectionNavItem[];
  userRole: string;
}

export function EventManageDesktopNav({ items, userRole }: EventManageDesktopNavProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <SectionNav items={items} userRole={userRole} />
    </div>
  );
}

export default EventManageDesktopNav;
