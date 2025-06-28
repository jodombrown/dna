
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EmptyState from './EmptyState';
import EventDetailDialog from "./EventDetailDialog";
import { Professional, Community, Event } from '@/types/search';
import { additionalEvents, sampleCreators } from './eventData';
import PopularEventsSection from './PopularEventsSection';
import EventCategoriesSection from './EventCategoriesSection';
import FeaturedCalendarsSection from './FeaturedCalendarsSection';
import LocalEventsSection from './LocalEventsSection';

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
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);

  // Filter out specific professionals
  const filteredProfessionals = professionals.filter(professional => 
    professional.full_name !== "Zara Hassan" && 
    professional.full_name !== "Emmanuel Nyong"
  );

  // Filter out specific communities
  const filteredCommunities = communities.filter(community => 
    !community.name.includes("Pan-African Researchers")
  );

  // Filter out the Pan-African Researchers event
  const filteredEvents = events.filter(event => 
    !event.title.includes("Pan-African Researchers")
  );

  // Combine filtered events with additional events
  const allEventsWithCreators = [...filteredEvents, ...additionalEvents].map((event, idx) => {
    if (idx < 9 && !event.creator_profile) {
      return {
        ...event,
        creator_profile: sampleCreators[idx % sampleCreators.length]
      };
    }
    return event;
  });

  const openEventDialog = (event: Event) => {
    setSelectedEvent(event);
    setDetailDialogOpen(true);
  };

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="professionals">Professionals ({filteredProfessionals.length})</TabsTrigger>
          <TabsTrigger value="communities">Communities ({filteredCommunities.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({allEventsWithCreators.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="professionals">
          {filteredProfessionals.length === 0 ? (
            <EmptyState type="professionals" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onConnect={() => onConnect(professional.id)}
                  onMessage={() => onMessage(professional.id, professional.full_name)}
                  connectionStatus={getConnectionStatus(professional.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="communities">
          {filteredCommunities.length === 0 ? (
            <EmptyState type="communities" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onJoin={onJoinCommunity}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {allEventsWithCreators.length === 0 ? (
            <EmptyState type="events" onRefresh={onRefresh} />
          ) : (
            <div className="space-y-12">
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Events</h2>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Explore, share, and create events near you, building meaningful connections through gatherings that matter
                </p>
              </div>

              <PopularEventsSection 
                events={allEventsWithCreators}
                onEventClick={openEventDialog}
                onRegisterEvent={onRegisterEvent}
              />

              <EventCategoriesSection />

              <FeaturedCalendarsSection />

              <LocalEventsSection />
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <EventDetailDialog
        open={detailDialogOpen}
        onOpenChange={(open) => {
          setDetailDialogOpen(open);
          if (!open) setTimeout(() => setSelectedEvent(null), 200);
        }}
        event={selectedEvent}
        onRegister={onRegisterEvent}
        isLoggedIn={isLoggedIn}
      />
    </>
  );
};

export default ConnectTabs;
