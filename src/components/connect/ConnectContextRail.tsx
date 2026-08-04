/**
 * ConnectContextRail — the Connect surface's left rail (AppShell `context`).
 *
 * FILTERS ONLY, and identical across all four Connect lenses (BD363 §3): the
 * rail is context, never navigation, so it does not change when the lens
 * changes. It carries no state of its own — it renders the shared
 * `FilterState` and calls the surface's filter handler, the same shape
 * NetworkPanel already uses.
 *
 * The C-engagement filter colours its active chip through the `c5` Tailwind
 * key (BD363 §8). It must never borrow FiveCsEngagement's banned purple badge
 * colour, which is not a D092 hue.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FilterState } from '@/components/connect/hub';

interface ConnectContextRailProps {
  filters: FilterState;
  onFilterChange: (patch: Partial<FilterState>) => void;
}

type CEngagement = FilterState['cEngagement'];

const C_OPTIONS: { id: CEngagement; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'connect', label: 'Connect' },
  { id: 'convene', label: 'Convene' },
  { id: 'collaborate', label: 'Collaborate' },
  { id: 'contribute', label: 'Contribute' },
  { id: 'convey', label: 'Convey' },
];

/**
 * Full literal class strings — Tailwind's JIT scanner cannot see a class built
 * by interpolation, so each C's active chip is spelled out. Every value
 * resolves through the `c5` key; there is no raw colour literal here.
 */
const C_ACTIVE: Record<CEngagement, string> = {
  all: 'bg-primary/10 text-primary border-primary/30',
  connect: 'bg-c5-connect/10 text-c5-connect border-c5-connect/30',
  convene: 'bg-c5-convene/10 text-c5-convene border-c5-convene/30',
  collaborate: 'bg-c5-collaborate/10 text-c5-collaborate border-c5-collaborate/30',
  contribute: 'bg-c5-contribute/10 text-c5-contribute border-c5-contribute/30',
  convey: 'bg-c5-convey/10 text-c5-convey border-c5-convey/30',
};

const HERITAGE_REGIONS = [
  'West Africa',
  'East Africa',
  'North Africa',
  'Central Africa',
  'Southern Africa',
];

const DIASPORA_LOCATIONS = [
  'United States',
  'United Kingdom',
  'Canada',
  'France',
  'Germany',
  'United Arab Emirates',
];

export function ConnectContextRail({ filters, onFilterChange }: ConnectContextRailProps) {
  const region = filters.regions[0] ?? 'any';
  const location = filters.diasporaLocations[0] ?? 'anywhere';

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* C engagement */}
      <div className="flex flex-col gap-2">
        <p className="text-micro uppercase text-muted-foreground">C engagement</p>
        <div className="flex flex-wrap gap-1.5">
          {C_OPTIONS.map((option) => {
            const isActive = filters.cEngagement === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => onFilterChange({ cEngagement: option.id })}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-meta transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? C_ACTIVE[option.id]
                    : 'border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Region */}
      <div className="flex flex-col gap-2">
        <p className="text-micro uppercase text-muted-foreground">Region</p>
        <Select
          value={region}
          onValueChange={(value) =>
            onFilterChange({ regions: value === 'any' ? [] : [value] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any region</SelectItem>
            {HERITAGE_REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Diaspora location */}
      <div className="flex flex-col gap-2">
        <p className="text-micro uppercase text-muted-foreground">Diaspora location</p>
        <Select
          value={location}
          onValueChange={(value) =>
            onFilterChange({ diasporaLocations: value === 'anywhere' ? [] : [value] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Anywhere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="anywhere">Anywhere</SelectItem>
            {DIASPORA_LOCATIONS.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export default ConnectContextRail;
