
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import EnhancedProfessionalCard from './EnhancedProfessionalCard';
import EnhancedCommunityCard from './EnhancedCommunityCard';
import EnhancedEventCard from './EnhancedEventCard';
import EmptyState from './EmptyState';
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
              <EnhancedProfessionalCard
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
              <EnhancedCommunityCard 
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EnhancedEventCard
                key={event.id}
                event={event}
                onRegister={() => onRegisterEvent(event)}
                onEventClick={() => onEventClick(event)}
                onCreatorClick={onCreatorClick}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </>
  );
};

export default ConnectTabsContent;
