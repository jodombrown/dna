import { create } from 'zustand';

interface LayoutStore {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  activePillar: 'all' | 'connect' | 'collaborate' | 'contribute';
  mobileComposerOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
  setActivePillar: (pillar: 'all' | 'connect' | 'collaborate' | 'contribute') => void;
  toggleMobileComposer: () => void;
  setMobileComposer: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  leftSidebarOpen: false, // Default closed on mobile
  rightSidebarOpen: false, // Default closed on mobile
  activePillar: 'all',
  mobileComposerOpen: false,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setLeftSidebar: (open: boolean) => set({ leftSidebarOpen: open }),
  setRightSidebar: (open: boolean) => set({ rightSidebarOpen: open }),
  setActivePillar: (pillar: 'all' | 'connect' | 'collaborate' | 'contribute') => set({ activePillar: pillar }),
  toggleMobileComposer: () => set((state) => ({ mobileComposerOpen: !state.mobileComposerOpen })),
  setMobileComposer: (open: boolean) => set({ mobileComposerOpen: open }),
}));