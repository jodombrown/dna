import React, { createContext, useContext, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeContextType {
  getOrCreateChannel: (channelName: string) => RealtimeChannel;
  removeChannel: (channelName: string) => void;
  removeAllChannels: () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const useRealtimeContext = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
};

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const channelsRef = useRef<Map<string, RealtimeChannel>>(new Map());

  const getOrCreateChannel = useCallback((channelName: string) => {
    const existingChannel = channelsRef.current.get(channelName);
    if (existingChannel) {
      return existingChannel;
    }

    const newChannel = supabase.channel(channelName);
    channelsRef.current.set(channelName, newChannel);
    return newChannel;
  }, []);

  const removeChannel = useCallback((channelName: string) => {
    const channel = channelsRef.current.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      channelsRef.current.delete(channelName);
    }
  }, []);

  const removeAllChannels = useCallback(() => {
    channelsRef.current.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    channelsRef.current.clear();
  }, []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      removeAllChannels();
    };
  }, [removeAllChannels]);

  const value = {
    getOrCreateChannel,
    removeChannel,
    removeAllChannels
  };

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};