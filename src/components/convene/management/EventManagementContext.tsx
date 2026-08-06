import React from 'react';
import { Event as ConveneEvent } from '@/types/eventTypes';

export interface EventManagementContextType {
  event: ConveneEvent;
  userRole: string;
  isOrganizer: boolean;
  refetchEvent: () => void;
}

export const EventManagementContext = React.createContext<EventManagementContextType | null>(null);

export const useEventManagement = () => {
  const context = React.useContext(EventManagementContext);
  if (!context) {
    throw new Error('useEventManagement must be used within EventManagementContext.Provider');
  }
  return context;
};
