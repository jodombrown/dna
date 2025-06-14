import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EventCard from './EventCard';
import EmptyState from './EmptyState';
import EventDetailDialog from "./EventDetailDialog";
import { Professional, Community, Event } from '@/types/search';
import { useNavigate } from "react-router-dom";

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
  // New state for selected event dialog
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  // Mock 5 creator profiles -- these would come from backend in real app
  const sampleCreators = [
    {
      id: "u1",
      full_name: "Dr. Amara Okafor",
      avatar_url: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: "u2",
      full_name: "Kwame Asante",
      avatar_url: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: "u3",
      full_name: "Sarah Mwangi",
      avatar_url: "https://randomuser.me/api/portraits/women/68.jpg"
    },
    {
      id: "u4",
      full_name: "Ibrahim Diallo",
      avatar_url: "https://randomuser.me/api/portraits/men/90.jpg"
    },
    {
      id: "u5",
      full_name: "Fatima Al-Rashid",
      avatar_url: "https://randomuser.me/api/portraits/women/81.jpg"
    }
  ];

  // Assign creators to first 5 events for demo
  const eventsWithCreators = events.map((event, idx) => {
    if (idx < 5 && !event.creator_profile) {
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
          <TabsTrigger value="professionals">Professionals ({professionals.length})</TabsTrigger>
          <TabsTrigger value="communities">Communities ({communities.length})</TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="professionals">
          {professionals.length === 0 ? (
            <EmptyState type="professionals" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {professionals.map((professional) => (
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
          {communities.length === 0 ? (
            <EmptyState type="communities" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => (
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
          {eventsWithCreators.length === 0 ? (
            <EmptyState type="events" onRefresh={onRefresh} />
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {eventsWithCreators.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onRegister={onRegisterEvent}
                  isLoggedIn={isLoggedIn}
                  onClick={() => openEventDialog(event)}
                />
              ))}
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
