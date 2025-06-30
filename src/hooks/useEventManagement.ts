
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEventData } from '@/hooks/useEventData';
import { useEventActions } from '@/hooks/useEventActions';
import { filterEvents } from '@/utils/eventFilters';
import { EventFilters } from '@/types/eventTypes';

export const useEventManagement = () => {
  const { adminUser, loading: authLoading, hasAnyRole } = useAdminAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const canManageEvents = hasAnyRole(['super_admin', 'event_manager']);
  
  const { events, loading, fetchEvents } = useEventData(canManageEvents);
  const { handleEventAction } = useEventActions(fetchEvents);

  const filters: EventFilters = {
    searchTerm,
    typeFilter,
    activeTab
  };

  const filteredEvents = useMemo(() => {
    return filterEvents(events, filters);
  }, [events, searchTerm, typeFilter, activeTab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    filteredEvents,
    loading,
    authLoading,
    canManageEvents,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    activeTab,
    setActiveTab,
    fetchEvents,
    handleEventAction,
    navigate
  };
};
