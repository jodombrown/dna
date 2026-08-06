/**
 * LensRail: the DESKTOP presentation of a surface's lens set — a vertical
 * list, labels always visible, live counts where real, ~200px wide. It is NOT
 * the mobile LensBar rotated: LensBar is an icon-first horizontal strip built
 * to fit a phone's chrome row; this is a labelled sidebar rail built to fill a
 * desktop frame. Same two controls, same URL, different placement (S19, BD388
 * pack).
 *
 * Self-contained like LensBar/ViewSwitch: the active lens lives in the URL
 * (?lens=<id>), never in component state, so a surface reads one param
 * regardless of viewport and only one control is ever mounted at a time —
 * LensBar in the mobile chrome slot, LensRail in the desktop frame.
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

export type RailLens = {
  id: string; // becomes ?lens=<id>
  label: string;
  icon: LucideIcon;
  count?: number; // rendered only when > 0 — "counts where real", never a bare 0
};

interface LensRailProps {
  lenses: RailLens[];
  ariaLabel: string;
}

const LENS_KEY = 'lens';

export function LensRail({ lenses, ariaLabel }: LensRailProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(LENS_KEY);
  const activeId = lenses.find((l) => l.id === requested)?.id ?? lenses[0]?.id;

  const selectLens = (lens: RailLens) => {
    if (lens.id === activeId) return;
    haptic('light');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(LENS_KEY, lens.id);
        return next;
      },
      { replace: false }, // back button moves between lenses, matching LensBar
    );
  };

  return (
    <div role="tablist" aria-orientation="vertical" aria-label={ariaLabel} className="w-48 flex flex-col gap-1">
      {lenses.map((lens) => {
        const Icon = lens.icon;
        const isActive = lens.id === activeId;
        return (
          <button
            key={lens.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => selectLens(lens)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 text-body font-medium">{lens.label}</span>
            {typeof lens.count === 'number' && lens.count > 0 && (
              <span className="text-meta text-muted-foreground tabular-nums">{lens.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
