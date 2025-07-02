
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ProfessionalCard from './ProfessionalCard';
import CommunityCard from './CommunityCard';
import EmptyState from './EmptyState';
import ConnectEventsTab from './tabs/ConnectEventsTab';
import { Professional, Community, Event } from '@/types/search';

interface ConnectTabsContentProps {
  // Data
  professionals: Professional[];
  communities: Community[];
  events: Event[];
  
  // Event handlers
  onConnect: (professionalId: string) => void;
  onMessage: (recipientId: string, recipientName: string) => void;
  onJoinCommunity: () => void;
  onEventClick: (event: Event) => void;
  onRegisterEvent: (event: Event) => void;
  onCreatorClick: (creatorId: string) => void;
  onViewAll: () => void;
  onRefresh: () => void;
  
  // State
  getConnectionStatus: (professionalId: string) => any;
  isLoggedIn: boolean;
}

const ConnectTabsContent: React.FC<ConnectTabsContentProps> = ({
  professionals,
  communities,
  events,
  onConnect,
  onMessage,
  onJoinCommunity,
  onEventClick,
  onRegisterEvent,
  onCreatorClick,
  onViewAll,
  onRefresh,
  getConnectionStatus,
  isLoggedIn
}) => {
  return (
    <>
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
        {events.length === 0 ? (
          <EmptyState type="events" onRefresh={onRefresh} />
        ) : (
          <ConnectEventsTab
            events={events}
            onEventClick={onEventClick}
            onRegisterEvent={onRegisterEvent}
            onCreatorClick={onCreatorClick}
            onViewAll={onViewAll}
          />
        )}
      </TabsContent>
    </>
  );
};

export default ConnectTabsContent;
