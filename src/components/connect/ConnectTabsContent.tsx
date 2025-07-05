
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

  // Additional mock professionals for demo purposes
  const additionalProfessionals: Professional[] = [
    {
      id: 'prof11',
      full_name: 'Dr. Aminata Touré',
      profession: 'Biomedical Engineer',
      company: 'UNICEF Health Innovation',
      location: 'Geneva, Switzerland',
      country_of_origin: 'Burkina Faso',
      bio: 'Designing low-cost medical devices and health solutions for underserved communities in Africa.',
      skills: ['Biomedical Engineering', 'Medical Devices', 'Global Health', 'Innovation'],
      avatar_url: 'https://images.unsplash.com/photo-1594824226441-0a5b592e07c6?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof12',
      full_name: 'Emmanuel Nyong',
      profession: 'Blockchain Developer',
      company: 'ConsenSys Africa',
      location: 'Cape Town, South Africa',
      country_of_origin: 'Cameroon',
      bio: 'Building decentralized finance solutions to increase financial access across Africa.',
      skills: ['Blockchain', 'Smart Contracts', 'DeFi', 'Cryptocurrency'],
      avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof13',
      full_name: 'Zainab Hassan',
      profession: 'Social Impact Strategist',
      company: 'Gates Foundation',
      location: 'Seattle, USA',
      country_of_origin: 'Sudan',
      bio: 'Leading strategic initiatives to address poverty and improve education outcomes in Africa.',
      skills: ['Social Impact', 'Strategy', 'Education', 'Non-profit Management'],
      avatar_url: 'https://images.unsplash.com/photo-1573497019236-17f8177b81e8?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof14',
      full_name: 'Thabo Mthembu',
      profession: 'Supply Chain Innovator',
      company: 'Maersk Africa',
      location: 'Copenhagen, Denmark',
      country_of_origin: 'South Africa',
      bio: 'Revolutionizing logistics and supply chain operations to boost intra-African trade.',
      skills: ['Supply Chain', 'Logistics', 'Trade Finance', 'Operations'],
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof15',
      full_name: 'Mariam Keita',
      profession: 'Fashion Tech Entrepreneur',
      company: 'African Styles Global',
      location: 'Milan, Italy',
      country_of_origin: 'Mali',
      bio: 'Connecting African fashion designers with global markets through e-commerce platforms.',
      skills: ['Fashion Technology', 'E-commerce', 'Brand Development', 'Digital Marketing'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof16',
      full_name: 'Dr. Joseph Banda',
      profession: 'Water Resources Engineer',
      company: 'World Bank Water Global Practice',
      location: 'Washington DC, USA',
      country_of_origin: 'Zambia',
      bio: 'Developing sustainable water infrastructure projects across Sub-Saharan Africa.',
      skills: ['Water Engineering', 'Infrastructure', 'Project Finance', 'Sustainability'],
      avatar_url: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      is_mentor: false,
      is_investor: false,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof17',
      full_name: 'Asha Mohammed',
      profession: 'Digital Rights Advocate',
      company: 'Mozilla Foundation',
      location: 'Berlin, Germany',
      country_of_origin: 'Ethiopia',
      bio: 'Championing digital privacy and internet freedom across Africa and the Middle East.',
      skills: ['Digital Rights', 'Policy Advocacy', 'Internet Governance', 'Human Rights'],
      avatar_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof18',
      full_name: 'Charles Ochieng',
      profession: 'Sports Management Executive',
      company: 'FIFA Development Office',
      location: 'Zurich, Switzerland',
      country_of_origin: 'Kenya',
      bio: 'Promoting football development and infrastructure investment across African nations.',
      skills: ['Sports Management', 'Event Planning', 'Stakeholder Relations', 'Business Development'],
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      is_mentor: true,
      is_investor: true,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof19',
      full_name: 'Nkiru Okwu',
      profession: 'Mental Health Advocate',
      company: 'WHO Africa Region',
      location: 'Brazzaville, Congo',
      country_of_origin: 'Nigeria',
      bio: 'Leading mental health awareness campaigns and policy development across Africa.',
      skills: ['Mental Health', 'Public Health', 'Policy Development', 'Community Outreach'],
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b829?w=400',
      is_mentor: true,
      is_investor: false,
      looking_for_opportunities: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'prof20',
      full_name: 'Yusuf Al-Maktoum',
      profession: 'Green Finance Specialist',
      company: 'Islamic Development Bank',
      location: 'Jeddah, Saudi Arabia',
      country_of_origin: 'Somalia',
      bio: 'Structuring green bonds and climate finance solutions for sustainable development in Africa.',
      skills: ['Green Finance', 'Climate Finance', 'Islamic Banking', 'Sustainable Development'],
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
      is_mentor: false,
      is_investor: true,
      looking_for_opportunities: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  ];

  const [viewMoreClicks, setViewMoreClicks] = useState({
    professionals: 0,
    communities: 0
  });

  const allProfessionals = [...professionals, ...additionalProfessionals];
  const allCommunities = [...communities, ...additionalCommunities];
  
  // Progressive loading - show 5 more each time
  const getVisibleProfessionals = () => {
    const baseCount = professionals.length;
    const additionalCount = Math.min(additionalProfessionals.length, (viewMoreClicks.professionals + 1) * 5);
    return allProfessionals.slice(0, baseCount + additionalCount);
  };

  const getVisibleCommunities = () => {
    const baseCount = communities.length;
    const additionalCount = Math.min(additionalCommunities.length, (viewMoreClicks.communities + 1) * 5);
    return allCommunities.slice(0, baseCount + additionalCount);
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
  
  const remainingProfessionals = allProfessionals.length - visibleProfessionals.length;
  const remainingCommunities = allCommunities.length - visibleCommunities.length;
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
                  professional={professional}
                  onConnect={() => onConnect(professional.id)}
                  onMessage={() => onMessage(professional.id, professional.full_name)}
                  connectionStatus={getConnectionStatus(professional.id)}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>
            
            {remainingProfessionals > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreProfessionals}
                >
                  View More Professionals ({Math.min(5, remainingProfessionals)} more)
                </Button>
              </div>
            )}
          </div>
        )}
      </TabsContent>

      <TabsContent value="communities">
        {communities.length === 0 ? (
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
            
            {remainingCommunities > 0 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                  onClick={handleViewMoreCommunities}
                >
                  View More Communities ({Math.min(5, remainingCommunities)} more)
                </Button>
              </div>
            )}
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
