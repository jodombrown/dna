
import React, { useState } from 'react';

import EventRegistrationSidebar from './EventRegistrationSidebar';
import ConnectTabsContent from './ConnectTabsContent';
import ConnectDialogsManager from './ConnectDialogsManager';
import { Tabs } from '@/components/ui/tabs';
import { Professional, Community, Event } from '@/types/search';

interface ConnectTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  professionals: Professional[];
  communities: Community[];
  events: Event[];
  onConnect: (professionalId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  onJoinCommunity: () => void;
  onRegisterEvent: () => void;
  getConnectionStatus: (professionalId: string) => any;
  isLoggedIn: boolean;
  onRefresh: () => void;
}

const ConnectTabs: React.FC<ConnectTabsProps> = ({
  activeTab,
  setActiveTab,
  professionals,
  communities,
  events,
  onConnect,
  onMessage,
  onJoinCommunity,
  onRegisterEvent,
  getConnectionStatus,
  isLoggedIn,
  onRefresh
}) => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [registrationSidebarOpen, setRegistrationSidebarOpen] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = useState(false);

  const openRegistrationSidebar = (event: Event) => {
    const eventIndex = events.findIndex(e => e.id === event.id);
    setSelectedEvent(event);
    setSelectedEventIndex(eventIndex);
    setRegistrationSidebarOpen(true);
  };

  const openProfessionalDialog = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    if (professional) {
      setSelectedProfessional(professional);
      setProfessionalDialogOpen(true);
    }
  };

  const handleViewAll = () => {
    setDemoExplanationOpen(true);
  };

  const handleRegisterFromSidebar = () => {
    setRegistrationSidebarOpen(false);
    onRegisterEvent();
  };

  const handlePreviousEvent = () => {
    if (selectedEventIndex > 0) {
      const newIndex = selectedEventIndex - 1;
      const newEvent = events[newIndex];
      setSelectedEvent(newEvent);
      setSelectedEventIndex(newIndex);
    }
  };

  const handleNextEvent = () => {
    if (selectedEventIndex < events.length - 1) {
      const newIndex = selectedEventIndex + 1;
      const newEvent = events[newIndex];
      setSelectedEvent(newEvent);
      setSelectedEventIndex(newIndex);
    }
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <ConnectTabsContent
          professionals={professionals}
          communities={communities}
          events={events}
          onConnect={onConnect}
          onMessage={onMessage}
          onJoinCommunity={onJoinCommunity}
          onEventClick={openRegistrationSidebar}
          onRegisterEvent={openRegistrationSidebar}
          onCreatorClick={openProfessionalDialog}
          onViewAll={handleViewAll}
          onRefresh={onRefresh}
          getConnectionStatus={getConnectionStatus}
          isLoggedIn={isLoggedIn}
        />
      </Tabs>

      <EventRegistrationSidebar
        open={registrationSidebarOpen}
        onOpenChange={setRegistrationSidebarOpen}
        event={selectedEvent}
        onRegister={handleRegisterFromSidebar}
        onCreatorClick={openProfessionalDialog}
        onPreviousEvent={handlePreviousEvent}
        onNextEvent={handleNextEvent}
        hasPreviousEvent={selectedEventIndex > 0}
        hasNextEvent={selectedEventIndex < events.length - 1}
      />

      <ConnectDialogsManager
        professionalDialogOpen={professionalDialogOpen}
        selectedProfessional={selectedProfessional}
        onProfessionalDialogChange={setProfessionalDialogOpen}
        onConnect={onConnect}
        onMessage={onMessage}
        demoExplanationOpen={demoExplanationOpen}
        onDemoExplanationChange={setDemoExplanationOpen}
      />
    </>
  );
};

export default ConnectTabs;
