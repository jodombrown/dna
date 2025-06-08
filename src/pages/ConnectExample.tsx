
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ConnectHeader from '@/components/connect/ConnectHeader';
import SearchSection from '@/components/connect/SearchSection';
import ProfessionalCard from '@/components/connect/ProfessionalCard';
import CommunityCard from '@/components/connect/CommunityCard';
import EventCard from '@/components/connect/EventCard';
import EmptyState from '@/components/connect/EmptyState';
import { useSearch } from '@/hooks/useSearch';
import { useConnections } from '@/hooks/useConnections';
import { useMessages } from '@/hooks/useMessages';
import { Professional, Community, Event } from '@/types/search';

const ConnectExample = () => {
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Mock data with updated profile images
  const mockProfessionals: Professional[] = [
    {
      id: '1',
      full_name: 'Dr. Amara Okafor',
      profession: 'FinTech CEO & Blockchain Expert',
      company: 'AfricaPay Solutions',
      location: 'London, UK',
      country_of_origin: 'Nigeria',
      expertise: ['Blockchain', 'Financial Inclusion', 'Digital Payments'],
      availability_for: ['Mentorship', 'Investment', 'Advisory'],
      bio: 'Leading financial inclusion through blockchain technology across West Africa. Former Goldman Sachs VP.',
      profile_image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/amaraokafor'
    },
    {
      id: '2',
      full_name: 'Prof. Kwame Asante',
      profession: 'AgriTech Innovator & Researcher',
      company: 'GreenGrow Technologies',
      location: 'Toronto, Canada',
      country_of_origin: 'Ghana',
      expertise: ['Sustainable Agriculture', 'Climate Tech', 'Food Security'],
      availability_for: ['Collaboration', 'Research Partnerships'],
      bio: 'Pioneer in climate-smart agriculture solutions. Published researcher with 50+ papers on sustainable farming.',
      profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/kwameasante'
    },
    {
      id: '3',
      full_name: 'Zara Mbeki',
      profession: 'Impact Investment Director',
      company: 'Africa Growth Fund',
      location: 'New York, USA',
      country_of_origin: 'South Africa',
      expertise: ['Impact Investing', 'ESG', 'Private Equity'],
      availability_for: ['Investment', 'Board Positions', 'Strategic Advisory'],
      bio: 'Managing $500M+ in African impact investments. Former McKinsey partner specializing in emerging markets.',
      profile_image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/zarambeki'
    },
    {
      id: '4',
      full_name: 'Ibrahim Hassan',
      profession: 'EdTech Entrepreneur',
      company: 'LearnAfrica',
      location: 'Berlin, Germany',
      country_of_origin: 'Egypt',
      expertise: ['Educational Technology', 'AI in Education', 'Digital Literacy'],
      availability_for: ['Partnerships', 'Scaling Support', 'Mentorship'],
      bio: 'Building AI-powered education platforms serving 2M+ students across MENA and Sub-Saharan Africa.',
      profile_image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/ibrahimhassan'
    },
    {
      id: '5',
      full_name: 'Fatima Kone',
      profession: 'Healthcare Innovation Lead',
      company: 'MedTech Solutions',
      location: 'Paris, France',
      country_of_origin: 'Côte d\'Ivoire',
      expertise: ['Digital Health', 'Telemedicine', 'Health Systems'],
      availability_for: ['Collaboration', 'Technical Expertise', 'Funding'],
      bio: 'Developing telemedicine solutions for rural Africa. Former WHO consultant on digital health initiatives.',
      profile_image: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/fatimakone'
    },
    {
      id: '6',
      full_name: 'Kofi Mensah',
      profession: 'Renewable Energy Engineer',
      company: 'SolarTech Africa',
      location: 'Amsterdam, Netherlands',
      country_of_origin: 'Ghana',
      expertise: ['Solar Energy', 'Grid Infrastructure', 'Energy Storage'],
      availability_for: ['Technical Consulting', 'Project Development'],
      bio: 'Leading solar energy projects across West Africa. MIT graduate with 15+ years in renewable energy.',
      profile_image: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
      linkedin_url: 'https://linkedin.com/in/kofimensah'
    }
  ];

  const mockCommunities: Community[] = [
    {
      id: '1',
      name: 'African Tech Entrepreneurs',
      description: 'A global network of African tech founders and entrepreneurs building the next generation of African startups.',
      member_count: 1250,
      category: 'Technology',
      location: 'Global',
      is_verified: true
    },
    {
      id: '2',
      name: 'Women in African Business',
      description: 'Empowering African women in business through mentorship, networking, and collaborative opportunities.',
      member_count: 890,
      category: 'Business',
      location: 'Global',
      is_verified: true
    },
    {
      id: '3',
      name: 'Healthcare Innovators Network',
      description: 'Connecting healthcare professionals working on innovative solutions for African health challenges.',
      member_count: 567,
      category: 'Healthcare',
      location: 'Global',
      is_verified: true
    },
    {
      id: '4',
      name: 'Sustainable Agriculture Alliance',
      description: 'Agricultural experts and innovators working on sustainable farming solutions for Africa.',
      member_count: 734,
      category: 'Agriculture',
      location: 'Global',
      is_verified: true
    }
  ];

  const mockEvents: Event[] = [
    {
      id: '1',
      title: 'African FinTech Summit 2025',
      description: 'Join leading FinTech innovators and investors for discussions on the future of African financial services.',
      date_time: '2025-09-15T09:00:00Z',
      location: 'Lagos, Nigeria',
      attendee_count: 450,
      type: 'Conference',
      is_virtual: false
    },
    {
      id: '2',
      title: 'Diaspora Investment Roundtable',
      description: 'Virtual roundtable connecting diaspora investors with high-impact African startups and projects.',
      date_time: '2025-08-20T14:00:00Z',
      location: 'Virtual',
      attendee_count: 120,
      type: 'Workshop',
      is_virtual: true
    },
    {
      id: '3',
      title: 'Women in Tech Africa',
      description: 'Celebrating and supporting women leaders in African technology and innovation.',
      date_time: '2025-10-08T10:00:00Z',
      location: 'Nairobi, Kenya',
      attendee_count: 320,
      type: 'Networking',
      is_virtual: false
    },
    {
      id: '4',
      title: 'Sustainable Development Goals Workshop',
      description: 'Workshop on leveraging diaspora expertise to accelerate SDG progress across Africa.',
      date_time: '2025-07-25T13:00:00Z',
      location: 'Virtual',
      attendee_count: 200,
      type: 'Workshop',
      is_virtual: true
    },
    {
      id: '5',
      title: 'African Cultural Heritage Symposium',
      description: 'Exploring the preservation and promotion of African cultural heritage through diaspora networks.',
      date_time: '2025-11-12T11:00:00Z',
      location: 'Cairo, Egypt',
      attendee_count: 280,
      type: 'Cultural',
      is_virtual: false
    },
    {
      id: '6',
      title: 'AgriTech Innovation Summit',
      description: 'Showcasing cutting-edge agricultural technologies and sustainable farming innovations for Africa.',
      date_time: '2025-09-30T09:30:00Z',
      location: 'Kigali, Rwanda',
      attendee_count: 380,
      type: 'Conference',
      is_virtual: false
    }
  ];

  const {
    searchQuery,
    selectedFilters,
    activeTab,
    setSearchQuery,
    setSelectedFilters,
    setActiveTab,
    filteredResults
  } = useSearch({
    professionals: mockProfessionals,
    communities: mockCommunities,
    events: mockEvents
  });

  const { connectionStatus, sendConnectionRequest } = useConnections();
  const { sendMessage } = useMessages();

  const handleConnect = (professional: Professional) => {
    sendConnectionRequest(professional.id);
  };

  const handleMessage = (professional: Professional) => {
    sendMessage(professional.id, `Hi ${professional.full_name.split(' ')[0]}, I'd love to connect and learn more about your work!`);
  };

  const handleJoinCommunity = (community: Community) => {
    setSelectedCommunity(community);
    setShowJoinDialog(true);
  };

  const handleRegisterEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowRegisterDialog(true);
  };

  const isLoggedIn = false; // Mock logged out state for demo

  const renderContent = () => {
    if (!isLoggedIn) {
      return <EmptyState />;
    }

    const results = filteredResults();

    if (activeTab === 'professionals') {
      return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.professionals.map((professional) => (
            <ProfessionalCard
              key={professional.id}
              professional={professional}
              onConnect={() => handleConnect(professional)}
              onMessage={() => handleMessage(professional)}
              connectionStatus={connectionStatus[professional.id] || null}
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
              onJoin={() => handleJoinCommunity(community)}
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
              onRegister={() => handleRegisterEvent(event)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ConnectHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-dna-copper text-white text-sm px-3 py-1">
              Platform Preview
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Connect with Africa's Global Network
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Discover and connect with verified African diaspora professionals, join thriving communities, 
            and participate in events that drive meaningful change across the continent.
          </p>
        </div>

        <SearchSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="mt-8">
          {renderContent()}
        </div>
      </main>

      {/* Join Community Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-dna-forest">Join Community - Coming Soon!</DialogTitle>
            <DialogDescription className="text-gray-600">
              We're building an amazing community experience for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dna-emerald/5 rounded-lg p-4">
              <h4 className="font-medium text-dna-forest mb-2">
                {selectedCommunity?.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedCommunity?.description}
              </p>
              <div className="text-sm text-dna-emerald font-medium">
                {selectedCommunity?.member_count} members • {selectedCommunity?.category}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">When this feature launches, you'll be able to:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Join verified professional communities</li>
                <li>• Participate in member-only discussions</li>
                <li>• Access exclusive events and resources</li>
                <li>• Connect with like-minded professionals</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowJoinDialog(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Stay Notified About Launch
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Register Event Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-dna-forest">Event Registration - Coming Soon!</DialogTitle>
            <DialogDescription className="text-gray-600">
              We're preparing an exceptional event experience for the diaspora community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-dna-emerald/5 rounded-lg p-4">
              <h4 className="font-medium text-dna-forest mb-2">
                {selectedEvent?.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {selectedEvent?.description}
              </p>
              <div className="text-sm text-dna-emerald font-medium">
                {selectedEvent?.attendee_count} registered • {selectedEvent?.type}
                {selectedEvent?.is_virtual && (
                  <Badge className="ml-2 bg-dna-emerald text-white text-xs">Virtual</Badge>
                )}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">When event registration launches, you'll enjoy:</p>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Seamless event registration and calendar integration</li>
                <li>• Pre-event networking with other attendees</li>
                <li>• Access to event materials and recordings</li>
                <li>• Follow-up collaboration opportunities</li>
              </ul>
            </div>
            <Button 
              onClick={() => setShowRegisterDialog(false)}
              className="w-full bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Stay Notified About Launch
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectExample;
