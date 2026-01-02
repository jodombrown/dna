/**
 * FocusPanelFooter - Footer component for Focus Mode panels
 *
 * Provides navigation link to the full Hub view for deeper exploration.
 * Used in both desktop panel and mobile sheet variants.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FocusModule } from '@/hooks/useFocusMode';

interface FocusPanelFooterProps {
  module: FocusModule;
  onNavigate?: () => void;
  className?: string;
}

const MODULE_HUB_ROUTES: Record<FocusModule, string> = {
  connect: '/dna/connect',
  convene: '/dna/convene',
  collaborate: '/dna/collaborate',
  contribute: '/dna/contribute',
  convey: '/dna/convey',
};

const MODULE_HUB_LABELS: Record<FocusModule, string> = {
  connect: 'Go to Connect Hub',
  convene: 'Go to Convene Hub',
  collaborate: 'Go to Collaborate Hub',
  contribute: 'Go to Contribute Hub',
  convey: 'Go to Convey Hub',
};

export function FocusPanelFooter({ module, onNavigate, className }: FocusPanelFooterProps) {
  return (
    <div
      className={cn(
        'px-4 py-3',
        'border-t border-neutral-100',
        'bg-neutral-50/50',
        className
      )}
    >
      <Link
        to={MODULE_HUB_ROUTES[module]}
        onClick={onNavigate}
        className={cn(
          'flex items-center justify-center gap-2',
          'w-full py-2.5 px-4',
          'text-sm font-medium',
          'text-dna-emerald',
          'bg-white',
          'border border-dna-emerald/20',
          'rounded-lg',
          'hover:bg-dna-emerald/5',
          'hover:border-dna-emerald/40',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-dna-emerald focus:ring-offset-2'
        )}
      >
        {MODULE_HUB_LABELS[module]}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default FocusPanelFooter;
