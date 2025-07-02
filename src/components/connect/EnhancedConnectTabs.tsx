
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import EventRegistrationSidebar from './EventRegistrationSidebar';
import ConnectTabsContent from './ConnectTabsContent';
import ConnectDialogsManager from './ConnectDialogsManager';
import { Professional, Community, Event } from '@/types/search';

interface EnhancedConnectTabsProps {
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

const EnhancedConnectTabs: React.FC<EnhancedConnectTabsProps> = ({
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
  const [selectedEventIndex, setSelectedEventIndex] = React.useState(0);
  const [registrationSidebarOpen, setRegistrationSidebarOpen] = React.useState(false);
  const [selectedProfessional, setSelectedProfessional] = React.useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = React.useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = React.useState(false);

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
      <div className="sticky top-20 z-10 bg-gray-50 pb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
            <TabsTrigger 
              value="professionals" 
              className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-dna-emerald data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="font-medium">Professionals</span>
              <Badge 
                className={`ml-1 text-xs ${
                  activeTab === 'professionals' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {professionals.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="communities"
              className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-dna-emerald data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="font-medium">Communities</span>
              <Badge 
                className={`ml-1 text-xs ${
                  activeTab === 'communities' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {communities.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="relative flex items-center justify-center gap-2 px-4 py-3 rounded-md data-[state=active]:bg-dna-emerald data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-200"
            >
              <span className="font-medium">Events</span>
              <Badge 
                className={`ml-1 text-xs ${
                  activeTab === 'events' 
                    ? 'bg-white/20 text-white border-white/30' 
                    : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
              >
                {events.length}
              </Badge>
            </TabsTrigger>
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

export default EnhancedConnectTabs;
