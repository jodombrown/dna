import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { MESSAGING_ENABLED } from '@/config/featureFlags';

import AppShell from '@/layouts/AppShell';
import type { DnaMobileHeaderBubble } from '@/components/mobile/DnaMobileHeader';
import { type ConnectTab } from '@/components/connect/ConnectMobileHeader';
import { type FilterState } from '@/components/connect/hub';
import { ConnectContextRail } from '@/components/connect/ConnectContextRail';
import { ConnectRelatedRail } from '@/components/connect/ConnectRelatedRail';
import { ConnectWell } from '@/components/connect/ConnectWell';

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

  // The filter rail folds beneath the well on mobile (AppShell stacks it under
  // the content). The header bubble's filter button scrolls to it — the same
  // affordance the retired ConnectMobileTopBar exposed, now pointing at the
  // rail's real home instead of a separate sheet.
  const filtersRef = useRef<HTMLDivElement>(null);

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

  // Count the filters that differ from the empty default, so the mobile header
  // bubble can badge the active count exactly as ConnectMobileTopBar did.
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.cEngagement !== 'all') count += 1;
    count += filters.regions.length;
    count += filters.diasporaLocations.length;
    return count;
  }, [filters]);

  // The search bubble ConnectMobileTopBar used to pass, now handed to the shell,
  // which owns the one mobile header (BD110).
  const bubble: DnaMobileHeaderBubble = {
    kind: 'search',
    placeholder: 'Search members...',
    onFiltersClick: () =>
      filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    activeFilterCount,
  };

  // The left rail is context, never navigation, and does not change with the lens.
  const context = (
    <div ref={filtersRef}>
      <ConnectContextRail filters={filters} onFilterChange={handleFilterChange} />
    </div>
  );

  // The map lens is full-bleed: pass NO `related` so AppShell drops the right
  // track entirely (never an empty node).
  const related =
    activeLens === 'map' ? undefined : (
      <ConnectRelatedRail onMessageUser={handleMessageMember} />
    );

  // The well (LensBar + the single active lens body) owns its own padding in a
  // component under src/components, so this page carries no layout values.
  return (
    <AppShell bubble={bubble} context={context} related={related}>
      <ConnectWell
        activeLens={activeLens}
        filters={filters}
        onMessageMember={handleMessageMember}
        onClearFilters={handleClearFilters}
      />
    </AppShell>
  );
};

export default Connect;
