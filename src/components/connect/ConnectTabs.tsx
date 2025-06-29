
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EventRegistrationSidebar from './EventRegistrationSidebar';
import ConnectTabsContent from './ConnectTabsContent';
import ConnectDialogsManager from './ConnectDialogsManager';
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
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [registrationSidebarOpen, setRegistrationSidebarOpen] = React.useState(false);
  const [selectedProfessional, setSelectedProfessional] = React.useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = React.useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = React.useState(false);

  const openRegistrationSidebar = (event: Event) => {
    setSelectedEvent(event);
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

  return (
    <>
      <div className="sticky top-20 z-10 bg-gray-50 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

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
      </div>

      <EventRegistrationSidebar
        open={registrationSidebarOpen}
        onOpenChange={setRegistrationSidebarOpen}
        event={selectedEvent}
        onRegister={handleRegisterFromSidebar}
        onCreatorClick={openProfessionalDialog}
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
