/**
 * LensBar — route-driven segmented control for switching the "lens" on a surface.
 *
 * The active lens lives in the URL (?lens=<id>), never in component state. This
 * is what makes the back button move between lenses instead of leaving the
 * surface, and what lets a link land directly on a lens. See BD332.
 *
 * First consumer of the D092 palette: the active lens icon carries the surface's
 * C, resolved through the `c5` Tailwind key (no raw colour anywhere here).
 */

import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

/** The five surfaces of the D092 palette. */
export type LensC = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';

export type Lens = {
  id: string; // becomes ?lens=<id>
  label: string;
  icon: LucideIcon;
  description?: string; // rendered as the descriptor line and folded into the accessible name
  disabled?: boolean; // renders present-but-unreachable
};

interface LensBarProps {
  lenses: Lens[];
  ariaLabel: string;
  /** The surface's C. Colours the active lens icon through the c5 key. */
  c: LensC;
}

/**
 * Full literal class strings — Tailwind's JIT scanner cannot see a class built
 * by string interpolation, so the map is spelled out. Every value resolves
 * through the `c5` key; there is no raw colour literal in this file, which is
 * the point of shipping the primitive against the gate on main.
 */
const C_ICON: Record<LensC, string> = {
  connect: 'text-c5-connect',
  convene: 'text-c5-convene',
  collaborate: 'text-c5-collaborate',
  contribute: 'text-c5-contribute',
  convey: 'text-c5-convey',
};

const LENS_KEY = 'lens';

export function LensBar({ lenses, ariaLabel, c }: LensBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active lens is read from the URL. When ?lens= is absent or unrecognised the
  // first lens is active — and we do NOT rewrite the URL to say so on mount.
  const requested = searchParams.get(LENS_KEY);
  const activeLens = lenses.find((l) => l.id === requested) ?? lenses[0];
  const activeId = activeLens?.id;

  const trackRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ x: number; w: number } | null>(null);
  const [ready, setReady] = useState(false);

  const selectLens = useCallback(
    (lens: Lens) => {
      if (lens.disabled || lens.id === activeId) return;
      haptic('light');
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(LENS_KEY, lens.id);
          return next;
        },
        { replace: false }, // back button moves between lenses, not off the surface
      );
    },
    [activeId, setSearchParams],
  );

  // Place the active chip behind the active lens and keep it in view. Runs
  // before paint so the first frame lands in position rather than sliding in
  // from zero; the transition only turns on once that placement has happened.
  useLayoutEffect(() => {
    const track = trackRef.current;
    const btn = activeId ? btnRefs.current[activeId] : null;
    if (!track || !btn) return;

    setIndicator({ x: btn.offsetLeft, w: btn.offsetWidth });

    const left = btn.offsetLeft;
    const right = left + btn.offsetWidth;
    if (left < track.scrollLeft) {
      track.scrollLeft = left - 4;
    } else if (right > track.scrollLeft + track.clientWidth) {
      track.scrollLeft = right - track.clientWidth + 4;
    }
  }, [activeId, lenses]);

  useLayoutEffect(() => {
    if (indicator && !ready) setReady(true);
  }, [indicator, ready]);

  return (
    <>
      <div
        ref={trackRef}
        role="tablist"
        aria-label={ariaLabel}
        className="relative flex items-center gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto scrollbar-hide"
      >
        {/* Active chip: absolutely positioned so tapping a lens never reflows its
            siblings. Sizes to its own content — never flex-1. */}
        {indicator && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1 bottom-1 left-0 rounded-md bg-background shadow-sm',
              ready && 'transition-[transform,width] duration-150 ease-out',
            )}
            style={{ transform: `translate3d(${indicator.x}px, 0, 0)`, width: indicator.w }}
          />
        )}

        {lenses.map((lens) => {
          const Icon = lens.icon;
          const isActive = lens.id === activeId;
          // Accessible name folds the description in where a surface supplies one.
          const name = lens.description ? `${lens.label} — ${lens.description}` : lens.label;

          return (
            <button
              key={lens.id}
              ref={(el) => {
                btnRefs.current[lens.id] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={name}
              aria-disabled={lens.disabled || undefined}
              tabIndex={lens.disabled ? -1 : 0}
              onClick={() => selectLens(lens)}
              className={cn(
                // 36px touch target. The active chip stays content-sized (flex-none,
                // p-2 for label breathing room) so tapping never re-flows the bar.
                // Inactive lenses are flex-1 with a 32px floor: they share whatever
                // the active chip leaves, evenly, and the scroll track only kicks in
                // when the set genuinely cannot fit — nothing clips.
                'relative z-10 flex min-h-9 items-center justify-center gap-1.5 rounded-md',
                isActive ? 'flex-none p-2' : 'min-w-8 flex-1',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                lens.disabled
                  ? 'cursor-default border border-dashed border-border'
                  : 'cursor-pointer',
                !isActive && !lens.disabled && 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon
                className={cn('h-4 w-4 shrink-0', isActive && C_ICON[c])}
                aria-hidden="true"
              />
              {/* Label renders on the active lens only; the icon-only inactive
                  shape is what fits six lenses on a 375px screen. */}
              {isActive && (
                <span className="whitespace-nowrap text-meta font-medium animate-in fade-in duration-100">
                  {lens.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active lens descriptor: one italic, muted line beneath the track, the
          single pattern every surface shares (BD332e). Renders only when the
          active lens carries a description; nothing reserves space when it does
          not, so the bar sits flush. The same copy feeds the accessible name
          above, so there is one source per lens. */}
      {activeLens?.description && (
        <p className="text-meta text-muted-foreground italic pt-2 pb-3">
          {activeLens.description}
        </p>
      )}
    </>
  );
}
