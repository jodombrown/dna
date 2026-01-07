import { create } from 'zustand';

interface HeaderVisibilityState {
  isHeaderHidden: boolean;
  hideHeader: () => void;
  showHeader: () => void;
}

/**
 * Global state for controlling header visibility.
 * Used primarily for mobile messaging where we want the chat to take full screen.
 */
export const useHeaderVisibility = create<HeaderVisibilityState>((set) => ({
  isHeaderHidden: false,
  hideHeader: () => set({ isHeaderHidden: true }),
  showHeader: () => set({ isHeaderHidden: false }),
}));
