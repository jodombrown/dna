import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MESSAGING_ENABLED } from '@/config/featureFlags';

import AppShell from '@/layouts/AppShell';
import { LensBar } from '@/components/shell/LensBar';
import { CONNECT_LENSES, type ConnectTab } from '@/components/connect/ConnectMobileHeader';
import { DiscoveryFeed, type FilterState } from '@/components/connect/hub';
import { ConnectContextRail } from '@/components/connect/ConnectContextRail';
import { ConnectRelatedRail } from '@/components/connect/ConnectRelatedRail';
import Network from '@/pages/dna/connect/Network';
import { DiasporaDensityMap } from '@/components/maps/DiasporaDensityMap';

/**
 * Connect — one shell, both widths (BD363).
 *
 * The surface renders a single <AppShell>: no isMobile branch, no Outlet. The
 * active lens lives in the URL (?lens=<id>) and is read here off the same param
 * the LensBar writes. The rail (context) is FILTERS ONLY and identical across
 * every lens; the related rail carries DIA + Invitations except on the
 * full-bleed map lens, which passes no `related` so the shell drops the track.
 *
 * There is exactly one LensBar on this surface and it is the same instance at
 * 390 and 1440 — the shell, not the surface, decides how the columns lay out.
 */

const CONNECT_LENS_IDS: ConnectTab[] = ['discover', 'network', 'map', 'messages'];

const EMPTY_FILTERS: FilterState = {
  cEngagement: 'all',
  regions: [],
  diasporaLocations: [],
};

const Connect = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [searchParams] = useSearchParams();

  // Reuse the shared FilterState shape rather than authoring new state.
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const lensParam = searchParams.get('lens');
  const activeLens: ConnectTab =
    lensParam && CONNECT_LENS_IDS.includes(lensParam as ConnectTab)
      ? (lensParam as ConnectTab)
      : 'discover';

  const handleFilterChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
  }, []);

  // BD063 hide-and-freeze: DM messaging is OUT at v0.0 — messaging a member is a
  // no-op until MESSAGING_ENABLED flips back on.
  const handleMessageMember = useCallback((_memberId: string) => {
    if (!MESSAGING_ENABLED) return;
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // The left rail is context, never navigation, and does not change with the lens.
  const context = (
    <ConnectContextRail filters={filters} onFilterChange={handleFilterChange} />
  );

  // The map lens is full-bleed: pass NO `related` so AppShell drops the right
  // track entirely (never an empty node).
  const related =
    activeLens === 'map' ? undefined : (
      <ConnectRelatedRail onMessageUser={handleMessageMember} />
    );

  return (
    <AppShell context={context} related={related}>
      <div className="flex flex-col gap-3">
        <div className="px-4 pt-4">
          <LensBar lenses={CONNECT_LENSES} ariaLabel="Connect lenses" c="connect" />
        </div>

        {/* Exactly one lens body renders at a time. Messages never renders a
            body — its lens stays present-and-dashed in the bar while messaging
            is OUT. */}
        {activeLens === 'discover' && (
          <DiscoveryFeed
            filters={filters}
            onMessageMember={handleMessageMember}
            onClearFilters={handleClearFilters}
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
    </AppShell>
  );
};

export default Connect;
