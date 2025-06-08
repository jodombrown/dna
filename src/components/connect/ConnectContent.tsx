
import React from 'react';
import ProfessionalCard from '@/components/connect/ProfessionalCard';
import CommunityCard from '@/components/connect/CommunityCard';
import EventCard from '@/components/connect/EventCard';
import EmptyState from '@/components/connect/EmptyState';
import { Professional, Community, Event } from '@/types/search';

interface ConnectContentProps {
  activeTab: 'professionals' | 'communities' | 'events';
  searchTerm: string;
  mockProfessionals: Professional[];
  mockCommunities: Community[];
  mockEvents: Event[];
  isLoggedIn: boolean;
  onConnect: (professional: Professional) => void;
  onMessage: (professional: Professional) => void;
  onJoinCommunity: (community: Community) => void;
  onRegisterEvent: (event: Event) => void;
  onRefresh: () => void;
}

const ConnectContent: React.FC<ConnectContentProps> = ({
  activeTab,
  searchTerm,
  mockProfessionals,
  mockCommunities,
  mockEvents,
  isLoggedIn,
  onConnect,
  onMessage,
  onJoinCommunity,
  onRegisterEvent,
  onRefresh
}) => {
  const getFilteredData = () => {
    const searchLower = searchTerm.toLowerCase();
    
    if (activeTab === 'professionals') {
      return {
        professionals: mockProfessionals.filter(p => 
          p.full_name.toLowerCase().includes(searchLower) ||
          p.profession?.toLowerCase().includes(searchLower) ||
          p.company?.toLowerCase().includes(searchLower)
        ),
        communities: [],
        events: []
      };
    }
    
    if (activeTab === 'communities') {
      return {
        professionals: [],
        communities: mockCommunities.filter(c =>
          c.name.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
        ),
        events: []
      };
    }
    
    if (activeTab === 'events') {
      return {
        professionals: [],
        communities: [],
        events: mockEvents.filter(e =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower)
        )
      };
    }
    
    return { professionals: [], communities: [], events: [] };
  };

  if (!isLoggedIn) {
    return <EmptyState type={activeTab} onRefresh={onRefresh} />;
  }

  const results = getFilteredData();

  if (activeTab === 'professionals') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.professionals.map((professional) => (
          <ProfessionalCard
            key={professional.id}
            professional={professional}
            onConnect={() => onConnect(professional)}
            onMessage={() => onMessage(professional)}
            connectionStatus={null}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    );
  }

  if (activeTab === 'communities') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.communities.map((community) => (
          <CommunityCard
            key={community.id}
            community={community}
            onJoin={() => onJoinCommunity(community)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    );
  }

  if (activeTab === 'events') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onRegister={() => onRegisterEvent(event)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    );
  }

  return null;
};

export default ConnectContent;
