/**
 * ViewSwitch: two-state, icon-only toggle for switching HOW the same corpus
 * renders (list vs calendar), never WHAT corpus is loaded. That's LensBar's
 * job. Self-contained like LensBar: the active view lives in the URL
 * (?view=<id>), never in component state, so the page reads it the same way
 * it reads ?lens=. See S16 (BD388 pack): 40px each, icon only, always
 * exactly two, hairline border, no recessed track, never a strip of three.
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

export type ViewOption = {
  id: string; // becomes ?view=<id>
  label: string; // accessible name only, never rendered as text
  icon: LucideIcon;
};

interface ViewSwitchProps {
  options: [ViewOption, ViewOption]; // always exactly two
  ariaLabel: string;
}

const VIEW_KEY = 'view';

export function ViewSwitch({ options, ariaLabel }: ViewSwitchProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get(VIEW_KEY);
  const activeId = options.find((o) => o.id === requested)?.id ?? options[0].id;

  const selectView = (option: ViewOption) => {
    if (option.id === activeId) return;
    haptic('light');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(VIEW_KEY, option.id);
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div role="group" aria-label={ariaLabel} className="inline-flex border border-border rounded-md overflow-hidden shrink-0">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.id === activeId;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            aria-label={option.label}
            onClick={() => selectView(option)}
            className={cn(
              'h-10 w-10 flex items-center justify-center transition-colors',
              isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
