/**
 * PulseDockItem - Primary Navigation Item for Mobile Dock
 *
 * Frame B — colour is the one C you are in. The active-route slot spends its C
 * in exactly two places: the glyph+label as one mark and a 2px rule beneath.
 * Inactive slots carry no C. Status is shape, not hue: filled dot = active,
 * hollow ring = attention, numeral = count, crimson dot = urgent (the one
 * colour exception).
 */

import React from 'react';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PulseSection, PulseStatus, PulseKey } from '@/types/pulse';
import { prefetchHubRoute } from '@/lib/prefetchHubRoutes';

interface PulseDockItemProps {
  item: {
    key: PulseKey;
    label: string;
    icon: LucideIcon;
    href: string;
    isAdinkra?: boolean;
  };
  pulseData: PulseSection | null | undefined;
  isActive: boolean;
  onClick: () => void;
}

// Full literal class strings so the JIT scanner can see every C.
const C_MARK: Record<PulseKey, string> = {
  connect: 'text-c5-connect',
  convene: 'text-c5-convene',
  collaborate: 'text-c5-collaborate',
  contribute: 'text-c5-contribute',
  convey: 'text-c5-convey',
};

const C_RULE: Record<PulseKey, string> = {
  connect: 'bg-c5-connect',
  convene: 'bg-c5-convene',
  collaborate: 'bg-c5-collaborate',
  contribute: 'bg-c5-contribute',
  convey: 'bg-c5-convey',
};

export function PulseDockItem({ item, pulseData, isActive, onClick }: PulseDockItemProps) {
  const Icon = item.icon;
  const status = (pulseData?.status || 'dormant') as PulseStatus;
  const count = pulseData?.count ?? 0;

  const warm = () => {
    if (item.href) prefetchHubRoute(item.href);
  };

  return (
    <button
      onClick={onClick}
      onPointerDown={warm}
      onTouchStart={warm}
      onFocus={warm}
      className={cn(
        'flex flex-col items-center justify-center',
        'min-w-14 h-full px-1',
        'transition-all duration-75',
        'active:scale-[0.82] active:opacity-60',
        isActive ? C_MARK[item.key] : 'text-muted-foreground',
      )}
    >
      <div className="relative">
        <Icon
          className={item.isAdinkra ? 'w-6 h-6' : 'w-5 h-5'}
          strokeWidth={item.isAdinkra ? (isActive ? 2 : 1.75) : (isActive ? 2.5 : 2)}
        />

        {/* Status is shape, not hue. Numeral wins when there is a count;
            otherwise a dot whose shape encodes the status. No C hue rides here;
            crimson is the one exception, reserved for urgent. */}
        {count > 0 ? (
          <span
            className={cn(
              'absolute -top-1.5 -right-2',
              'min-w-4 h-4 px-1',
              'inline-flex items-center justify-center',
              'rounded-full border border-background',
              'text-micro leading-none text-background',
              status === 'urgent' ? 'bg-dna-crimson' : 'bg-foreground',
            )}
            aria-label={`${count} unread`}
          >
            {count > 99 ? '99+' : count}
          </span>
        ) : status === 'dormant' ? null : (
          <span
            className={cn(
              'absolute -top-1 -right-1 w-2 h-2 rounded-full',
              status === 'urgent'
                ? 'bg-dna-crimson border border-background'
                : status === 'attention'
                  ? 'border-2 border-foreground bg-background'
                  : 'bg-foreground border border-background',
            )}
          />
        )}
      </div>

      {/* Label — one mark with the glyph; colour inherited from the button. */}
      <span className={cn('text-micro mt-0.5', isActive && 'font-semibold')}>
        {item.label}
      </span>

      {/* Second place the active C is spent: a 2px rule beneath the mark. */}
      {isActive && (
        <span className={cn('h-0.5 w-4 rounded-full mt-0.5', C_RULE[item.key])} />
      )}
    </button>
  );
}

export default PulseDockItem;
