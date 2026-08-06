/**
 * MyEventsChromeBar — the mobile chrome row for My Events: the Attending/Hosting
 * LensBar and the List/Calendar ViewSwitch side by side. It lives in a component
 * (not inline in the page) so its edge padding stays out of the page-level
 * layout gate, exactly as ConveneTabStrip does for the hub.
 *
 * Renders in the ConveneShell tabs slot, which is mobile-only; on desktop the
 * same two controls appear as LensRail + a header ViewSwitch instead.
 */
import React from 'react';
import { Calendar, BarChart3, List, CalendarDays } from 'lucide-react';
import { LensBar } from '@/components/shell/LensBar';
import { ViewSwitch } from '@/components/shell/ViewSwitch';

export function MyEventsChromeBar() {
  return (
    <div className="md:hidden flex items-center justify-between gap-3 px-3 py-1.5 bg-background border-b border-border">
      <LensBar
        ariaLabel="My events"
        c="convene"
        lenses={[
          { id: 'attending', label: 'Attending', icon: Calendar },
          { id: 'hosting', label: 'Hosting', icon: BarChart3 },
        ]}
      />
      <ViewSwitch
        ariaLabel="View"
        options={[
          { id: 'list', label: 'List', icon: List },
          { id: 'calendar', label: 'Calendar', icon: CalendarDays },
        ]}
      />
    </div>
  );
}

export default MyEventsChromeBar;
