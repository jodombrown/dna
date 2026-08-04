
import React, { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
  // Additional mock communities for demo purposes
  const additionalCommunities: Community[] = [
    {
      id: 'extra1',
      name: 'Diaspora Investment Circle',
      description: 'Connecting African diaspora investors with high-impact investment opportunities across Africa.',
      category: 'Business',
      member_count: 890,
      is_featured: true,
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra2', 
      name: 'Women in African Tech',
      description: 'Empowering African women in technology through mentorship and networking.',
      category: 'Technology',
      member_count: 650,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra3',
      name: 'African Healthcare Innovation',
      description: 'Advancing healthcare solutions and medical innovation across Africa.',
      category: 'Healthcare',
      member_count: 420,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra4',
      name: 'Sustainable Energy Africa',
      description: 'Promoting renewable energy and sustainable development across African communities.',
      category: 'Energy',
      member_count: 380,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra5',
      name: 'African Creative Industries',
      description: 'Supporting artists, designers, and creative professionals in the diaspora.',
      category: 'Creative',
      member_count: 720,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra6',
      name: 'Financial Inclusion Africa',
      description: 'Driving financial technology and inclusion initiatives across African markets.',
      category: 'Finance',
      member_count: 540,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra7',
      name: 'African Agriculture Tech',
      description: 'Modernizing agriculture through technology and sustainable farming practices.',
      category: 'Agriculture',
      member_count: 310,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra8',
      name: 'African Youth Development',
      description: 'Mentoring and supporting the next generation of African leaders.',
      category: 'Education',
      member_count: 950,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'  
    },
    {
      id: 'extra9',
      name: 'Pan-African Legal Network',
      description: 'Connecting legal professionals working on African development and policy.',
      category: 'Legal',
      member_count: 260,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'extra10',
      name: 'African Media & Communications',
      description: 'Journalists, content creators, and media professionals telling African stories.',
      category: 'Media',
      member_count: 480,
      is_featured: false,
      image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const [viewMoreClicks, setViewMoreClicks] = useState({
    professionals: 0,
    communities: 0
  });

  const allProfessionals = professionals;
  const allCommunities = [...communities, ...additionalCommunities];
  
  // Show initial limited set, then add 10 more each time
  const getVisibleProfessionals = () => {
    const initialCount = 6; // Show only 6 initially
    const additionalPerClick = 10; // Add 10 more each time
    const totalToShow = initialCount + (viewMoreClicks.professionals * additionalPerClick);
    return allProfessionals.slice(0, totalToShow);
  };

  const getVisibleCommunities = () => {
    const initialCount = 9; // Show only 9 initially  
    const additionalPerClick = 10; // Add 10 more each time
    const totalToShow = initialCount + (viewMoreClicks.communities * additionalPerClick);
    return allCommunities.slice(0, totalToShow);
  };

  const handleViewMoreProfessionals = () => {
    setViewMoreClicks(prev => ({
      ...prev,
      professionals: prev.professionals + 1
    }));
  };

  const handleViewMoreCommunities = () => {
    setViewMoreClicks(prev => ({
      ...prev,
      communities: prev.communities + 1
    }));
  };

  const visibleProfessionals = getVisibleProfessionals();
  const visibleCommunities = getVisibleCommunities();
  
  const hasMoreProfessionals = visibleProfessionals.length < allProfessionals.length;
  const hasMoreCommunities = visibleCommunities.length < allCommunities.length;
  return (
    <>
      <TabsContent value="professionals">
        {professionals.length === 0 ? (
          <EmptyState type="professionals" onRefresh={onRefresh} />
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              {visibleProfessionals.map((professional) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional as any}
                  onConnect={() => onCreatorClick(professional.id)}
                  onMessage={() => onMessage(professional.id, professional.full_name)}
                  connectionStatus={getConnectionStatus(professional.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            
            {hasMoreProfessionals && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreProfessionals}
                >
                  View More Professionals
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="communities">
        {allCommunities.length === 0 ? (
          <EmptyState type="communities" onRefresh={onRefresh} />
        ) : (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCommunities.map((community) => (
                <CommunityCard 
                  key={community.id} 
                  community={community} 
                  onJoin={onJoinCommunity}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            
            {hasMoreCommunities && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreCommunities}
                >
                  View More Communities
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>
    </>
  );
};

export default ConnectTabsContent;
