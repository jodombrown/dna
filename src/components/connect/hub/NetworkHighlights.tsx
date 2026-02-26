import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, MapPin, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface NetworkHighlightsProps {
  onFilterBySector?: (sector: string) => void;
  onFilterByLocation?: (location: string) => void;
  className?: string;
}

export function NetworkHighlights({
  onFilterBySector,
  onFilterByLocation,
  className,
}: NetworkHighlightsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['network-highlights'],
    queryFn: async () => {
      try {
        const [industriesResult, locationsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('industries')
            .eq('is_public', true)
            .not('industries', 'is', null),
          supabase
            .from('profiles')
            .select('location')
            .eq('is_public', true)
            .not('location', 'is', null),
        ]);

        // Aggregate sectors
        const sectorCounts: Record<string, number> = {};
        industriesResult.data?.forEach((p) => {
          const industries = p.industries as string[] | null;
          if (industries) {
            industries.forEach((ind: string) => {
              const normalized = ind.trim();
              if (normalized) {
                sectorCounts[normalized] = (sectorCounts[normalized] || 0) + 1;
              }
            });
          }
        });

        // Aggregate locations
        const locationCounts: Record<string, number> = {};
        locationsResult.data?.forEach((p) => {
          const loc = (p.location as string)?.trim();
          if (loc) {
            locationCounts[loc] = (locationCounts[loc] || 0) + 1;
          }
        });

        const topSectors = Object.entries(sectorCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        const topLocations = Object.entries(locationCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name, count }));

        return { sectors: topSectors, locations: topLocations };
      } catch (error) {
        logger.warn('NetworkHighlights', 'Error fetching highlights:', error);
        return { sectors: [], locations: [] };
      }
    },
    staleTime: 300000, // 5 minutes
  });

  if (isLoading || !data || (data.sectors.length === 0 && data.locations.length === 0)) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Globe className="h-3.5 w-3.5" />
        Network Pulse
      </div>

      {/* Sectors */}
      {data.sectors.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.sectors.map((sector) => (
            <Badge
              key={sector.name}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors text-xs px-2.5 py-1"
              onClick={() => onFilterBySector?.(sector.name)}
            >
              <Briefcase className="h-3 w-3 mr-1 text-muted-foreground" />
              {sector.name}
              <span className="ml-1 font-bold text-foreground">({sector.count})</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Locations */}
      {data.locations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {data.locations.map((loc) => (
            <Badge
              key={loc.name}
              variant="outline"
              className="cursor-pointer hover:bg-accent hover:border-accent transition-colors text-xs px-2.5 py-1"
              onClick={() => onFilterByLocation?.(loc.name)}
            >
              <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
              {loc.name}
              <span className="ml-1 font-bold text-foreground">({loc.count})</span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default NetworkHighlights;
