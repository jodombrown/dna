/**
 * ConnectWell — the Connect content column (AppShell `children`).
 *
 * Lives under src/components, not src/pages, so it can own the well's padding:
 * the design-system page gate bans px-/py-/max-w-/container in src/pages, and
 * the LensBar row plus the network body genuinely need horizontal padding. The
 * page (Connect.tsx) stays a thin composition of shell + rails + this well.
 *
 * The LensBar is the first node here at both widths (BD363 §2/§4), and exactly
 * one lens body renders beneath it. Messages renders no body. The map lens is
 * full-bleed — it gets no padding wrapper so it spans the whole column.
 */

import React from 'react';
import { LensBar } from '@/components/shell/LensBar';
import { CONNECT_LENSES, type ConnectTab } from '@/components/connect/ConnectMobileHeader';
import { DiscoveryFeed, type FilterState } from '@/components/connect/hub';
import Network from '@/pages/dna/connect/Network';
import { DiasporaDensityMap } from '@/components/maps/DiasporaDensityMap';

interface ConnectWellProps {
  activeLens: ConnectTab;
  filters: FilterState;
  onMessageMember: (memberId: string) => void;
  onClearFilters: () => void;
}

export function ConnectWell({
  activeLens,
  filters,
  onMessageMember,
  onClearFilters,
}: ConnectWellProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="px-4 pt-4">
        <LensBar lenses={CONNECT_LENSES} ariaLabel="Connect lenses" c="connect" />
      </div>

      {activeLens === 'discover' && (
        <DiscoveryFeed
          filters={filters}
          onMessageMember={onMessageMember}
          onClearFilters={onClearFilters}
          viewMode="discover"
        />
      )}

      {activeLens === 'network' && (
        <div className="px-4 pb-6">
          <Network />
        </div>
      )}

      {activeLens === 'map' && <DiasporaDensityMap inShell />}
    </div>
  );
}

export default ConnectWell;
