/**
 * DNA Platform — useSponsorPlacements Hook
 * Fetches active sponsor placements for a given location and handles impression tracking.
 */

import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sponsorshipService, SponsorPlacement } from '@/services/sponsorshipService';

const impressedThisSession = new Set<string>();

export function useSponsorPlacements(placement: string) {
  const { data: placements = [], isLoading } = useQuery<SponsorPlacement[]>({
    queryKey: ['sponsor-placements', placement],
    queryFn: () => sponsorshipService.getActivePlacements(placement),
    staleTime: 5 * 60_000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  // Track impressions once per session per placement
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current || placements.length === 0) return;
    tracked.current = true;
    placements.forEach((p) => {
      if (!impressedThisSession.has(p.id)) {
        impressedThisSession.add(p.id);
        sponsorshipService.trackImpression(p.id);
      }
    });
  }, [placements]);

  const trackClick = (placementId: string) => {
    sponsorshipService.trackClick(placementId);
  };

  return { placements, isLoading, trackClick };
}
