
import React, { useState, useEffect } from 'react';
import { useEventManagement } from '@/hooks/useEventManagement';
import EventCreationDialog from '@/components/admin/EventCreationDialog';
import AdminEventStats from '@/components/admin/AdminEventStats';
import AdminEventFilters from '@/components/admin/AdminEventFilters';
import AdminEventTabs from '@/components/admin/AdminEventTabs';
import AdminEventHeader from '@/components/admin/AdminEventHeader';
import AdminEventAccessControl from '@/components/admin/AdminEventAccessControl';
import AdminEventLoadingState from '@/components/admin/AdminEventLoadingState';

const AdminEventManagement = () => {
  const {
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
  } = useEventManagement();

  const [createEventOpen, setCreateEventOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !canManageEvents) {
      navigate('/admin-dashboard');
      return;
    }
    if (canManageEvents) {
      fetchEvents();
    }
  }, [authLoading, canManageEvents, navigate, fetchEvents]);

  if (authLoading || loading) {
    return <AdminEventLoadingState />;
  }

  return (
    <>
      <AdminEventAccessControl 
        canManageEvents={canManageEvents}
        onNavigateBack={() => navigate('/admin-dashboard')}
      />
      
      {canManageEvents && (
        <div className="min-h-screen bg-gray-50">
          <AdminEventHeader
            onBack={() => navigate('/admin-dashboard')}
            onCreateEvent={() => setCreateEventOpen(true)}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <AdminEventStats events={events} />
            <AdminEventFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
            />

            <AdminEventTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredEvents={filteredEvents}
              searchTerm={searchTerm}
              typeFilter={typeFilter}
              onEventAction={handleEventAction}
            />
          </div>

          <EventCreationDialog
            open={createEventOpen}
            onOpenChange={setCreateEventOpen}
            onEventCreated={fetchEvents}
          />
        </div>
      )}
    </>
  );
};

export default AdminEventManagement;
