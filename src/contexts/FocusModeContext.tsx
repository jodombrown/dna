/**
 * FocusModeContext - State Management for Focus Mode Panels
 *
 * Focus Mode transforms DNA from tab-based navigation to an operating system experience.
 * When users click a C in the Pulse Bar, a focused panel appears showing the most
 * actionable items for that C without navigating away from the current context.
 *
 * Key behaviors:
 * - Desktop: Panel slides down from Pulse Bar, anchored below clicked item
 * - Mobile: Bottom sheet slides up
 * - Dismiss: Click backdrop, press Escape, or click close button
 * - Only one module can be focused at a time
 */

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';

export type FocusModule = 'connect' | 'convene' | 'collaborate' | 'contribute' | 'convey';

interface FocusModeContextType {
  /** Currently active module, or null if no panel is open */
  activeModule: FocusModule | null;
  /** Whether the focus panel is currently open */
  isOpen: boolean;
  /** Open the focus panel for a specific module */
  openFocus: (module: FocusModule) => void;
  /** Close the currently open focus panel */
  closeFocus: () => void;
  /** Toggle focus panel for a module (open if closed, close if same module is open) */
  toggleFocus: (module: FocusModule) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

/**
 * Hook to access Focus Mode state and actions
 * @throws Error if used outside of FocusModeProvider
 */
export function useFocusMode(): FocusModeContextType {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
}

interface FocusModeProviderProps {
  children: React.ReactNode;
}

export function FocusModeProvider({ children }: FocusModeProviderProps): React.ReactElement {
  const [activeModule, setActiveModule] = useState<FocusModule | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openFocus = useCallback((module: FocusModule) => {
    setActiveModule(module);
    setIsOpen(true);
  }, []);

  const closeFocus = useCallback(() => {
    setIsOpen(false);
    // Delay clearing the module to allow exit animation
    setTimeout(() => {
      setActiveModule(null);
    }, 200);
  }, []);

  const toggleFocus = useCallback((module: FocusModule) => {
    if (isOpen && activeModule === module) {
      closeFocus();
    } else {
      openFocus(module);
    }
  }, [isOpen, activeModule, openFocus, closeFocus]);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeFocus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeFocus]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const value: FocusModeContextType = {
    activeModule,
    isOpen,
    openFocus,
    closeFocus,
    toggleFocus,
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}

export default FocusModeProvider;
