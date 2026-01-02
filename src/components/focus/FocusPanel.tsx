/**
 * FocusPanel - Desktop Panel Container for Focus Mode
 *
 * Main entry point for the Focus Mode UI system.
 * Automatically selects between desktop panel and mobile sheet based on viewport.
 *
 * Desktop Specifications:
 * - Width: 400px (fixed)
 * - Max height: 70vh
 * - Position: Anchored below Pulse Bar, centered horizontally
 * - Animation: Slide down + fade in (200ms ease-out)
 * - Backdrop: Semi-transparent overlay (black 30%)
 * - Shadow: lg (0 10px 15px rgba(0,0,0,0.1))
 * - Border radius: 12px (bottom corners only)
 */

import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useFocusMode, type FocusModule } from '@/hooks/useFocusMode';
import { useMobile } from '@/hooks/useMobile';
import { FocusBackdrop } from './FocusBackdrop';
import { FocusPanelHeader } from './FocusPanelHeader';
import { FocusPanelFooter } from './FocusPanelFooter';
import { FocusSheet } from './FocusSheet';
import { ConnectFocus } from './connect/ConnectFocus';
import { ConveneFocus } from './convene/ConveneFocus';
import { CollaborateFocus } from './collaborate/CollaborateFocus';
import { ContributeFocus } from './contribute/ContributeFocus';
import { ConveyFocus } from './convey/ConveyFocus';

const FOCUS_COMPONENTS: Record<FocusModule, React.ComponentType> = {
  connect: ConnectFocus,
  convene: ConveneFocus,
  collaborate: CollaborateFocus,
  contribute: ContributeFocus,
  convey: ConveyFocus,
};

export function FocusPanel() {
  const { activeModule, isOpen, closeFocus } = useFocusMode();
  const { isMobile } = useMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle click outside panel (desktop only - mobile uses Drawer's backdrop)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Don't close if clicking on the Pulse Bar
        const target = event.target as HTMLElement;
        if (target.closest('[data-pulse-item]')) return;
        closeFocus();
      }
    };

    // Delay adding listener to prevent immediate close from the toggle click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, closeFocus]);

  // Don't render if no module is active
  if (!activeModule) return null;

  const FocusContent = FOCUS_COMPONENTS[activeModule];

  // Mobile: Use bottom sheet
  if (isMobile) {
    return (
      <FocusSheet isOpen={isOpen} onClose={closeFocus} module={activeModule}>
        <FocusContent />
      </FocusSheet>
    );
  }

  // Desktop: Use panel overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <FocusBackdrop onClick={closeFocus} />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed z-50',
              'top-28', // Below header (56px) + Pulse Bar (~56px)
              'left-1/2 -translate-x-1/2',
              'w-[400px] max-h-[70vh]',
              'bg-white',
              'rounded-b-xl',
              'shadow-lg',
              'overflow-hidden',
              'flex flex-col'
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby="focus-panel-title"
          >
            {/* Header */}
            <FocusPanelHeader module={activeModule} onClose={closeFocus} />

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4">
              <FocusContent />
            </div>

            {/* Footer */}
            <FocusPanelFooter module={activeModule} onNavigate={closeFocus} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default FocusPanel;
