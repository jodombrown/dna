/**
 * FocusSheet - Mobile Bottom Sheet for Focus Mode
 *
 * A drawer-style sheet that slides up from the bottom on mobile devices.
 * Uses vaul's Drawer component for native swipe-to-dismiss behavior.
 *
 * Specifications:
 * - Default height: 70% of screen
 * - Animation: Slide up with spring physics (300ms)
 * - Dismiss: Swipe down past threshold, tap backdrop, tap X
 * - Drag handle: Visible, 40px wide, centered
 * - Border radius: 16px (top corners)
 */

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FocusModule } from '@/hooks/useFocusMode';
import { FocusPanelFooter } from './FocusPanelFooter';

interface FocusSheetProps {
  isOpen: boolean;
  onClose: () => void;
  module: FocusModule;
  children: React.ReactNode;
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

export function FocusSheet({ isOpen, onClose, module, children }: FocusSheetProps) {
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent
        className={cn(
          'h-[70vh] max-h-[90vh]',
          'rounded-t-2xl',
          'focus:outline-none'
        )}
      >
        {/* Header */}
        <DrawerHeader className="relative px-4 pb-3 pt-2 border-b border-neutral-100">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold text-dna-forest-green text-left">
                {MODULE_TITLES[module]}
              </DrawerTitle>
              <DrawerDescription className="text-sm text-neutral-500 text-left">
                {MODULE_SUBTITLES[module]}
              </DrawerDescription>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-full',
                'hover:bg-neutral-100',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-dna-emerald focus:ring-offset-2'
              )}
              aria-label="Close focus sheet"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
        </DrawerHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        <FocusPanelFooter module={module} onNavigate={onClose} />
      </DrawerContent>
    </Drawer>
  );
}

export default FocusSheet;
