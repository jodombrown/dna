/**
 * FocusPanelHeader - Header component for Focus Mode panels
 *
 * Displays module title, subtitle, and close button.
 * Used in both desktop panel and mobile sheet variants.
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FocusModule } from '@/hooks/useFocusMode';

interface FocusPanelHeaderProps {
  module: FocusModule;
  onClose: () => void;
  className?: string;
}

const MODULE_TITLES: Record<FocusModule, string> = {
  connect: 'Connect',
  convene: 'Convene',
  collaborate: 'Collaborate',
  contribute: 'Contribute',
  convey: 'Convey',
};

const MODULE_SUBTITLES: Record<FocusModule, string> = {
  connect: 'Your network is growing',
  convene: 'Where the diaspora gathers',
  collaborate: 'Build together, impact together',
  contribute: 'Give what you have, get what you need',
  convey: 'Amplify our story',
};

export function FocusPanelHeader({ module, onClose, className }: FocusPanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        'border-b border-neutral-100',
        className
      )}
    >
      <div>
        <h2 className="text-lg font-semibold text-dna-forest-green">
          {MODULE_TITLES[module]}
        </h2>
        <p className="text-sm text-neutral-500">
          {MODULE_SUBTITLES[module]}
        </p>
      </div>
      <button
        onClick={onClose}
        className={cn(
          'p-2 rounded-full',
          'hover:bg-neutral-100',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-dna-emerald focus:ring-offset-2'
        )}
        aria-label="Close focus panel"
      >
        <X className="w-5 h-5 text-neutral-500" />
      </button>
    </div>
  );
}

export default FocusPanelHeader;
