import { create } from 'zustand';

interface LayoutStore {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  setLeftSidebar: (open: boolean) => void;
  setRightSidebar: (open: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  leftSidebarOpen: true,
  rightSidebarOpen: true,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setLeftSidebar: (open: boolean) => set({ leftSidebarOpen: open }),
  setRightSidebar: (open: boolean) => set({ rightSidebarOpen: open }),
}));