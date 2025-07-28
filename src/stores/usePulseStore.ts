import { create } from 'zustand';
import { pulseDataService, PulseDataResponse } from '@/services/pulseDataService';

type PulseData = PulseDataResponse;

interface PulseStore {
  data: PulseData | null;
  loading: boolean;
  error: string | null;
  fetchPulseData: (userId: string) => Promise<void>;
  resetPulseData: () => void;
}

export const usePulseStore = create<PulseStore>((set, get) => ({
  data: null,
  loading: false,
  error: null,

  fetchPulseData: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      const data = await pulseDataService.fetchPulseData(userId);
      set({ data, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching pulse data:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch pulse data' 
      });
    }
  },

  resetPulseData: () => {
    set({ data: null, loading: false, error: null });
  }
}));