import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import ConnectTabs from '@/components/connect/ConnectTabs';
import ConnectDialogsManager from '@/components/connect/ConnectDialogsManager';
import FeedbackPanel from '@/components/FeedbackPanel';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import CallToActionSection from '@/components/connect/CallToActionSection';
import SearchSection from '@/components/connect/search/SearchSection';
import { demoProfessionals, demoCommunities, demoEvents } from '@/data/demoSearchData';
import { Professional } from '@/types/search';

const ConnectExample = () => {
  useScrollToTop();
  const [searchParams] = useSearchParams();
  
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('professionals');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    location: '',
    skills: [],
    isMentor: false,
    isInvestor: false,
    lookingForOpportunities: false
  });

  // Handle search parameter from URL
  useEffect(() => {
    const queryParam = searchParams.get('q');
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);


  // Filter and search logic
  const filteredData = useMemo(() => {
    const filterText = searchTerm.toLowerCase();
    
    const filteredProfessionals = demoProfessionals.filter(prof => {
      // Text search
      const matchesText = !searchTerm || 
        prof.full_name.toLowerCase().includes(filterText) ||
        prof.profession.toLowerCase().includes(filterText) ||
        prof.company?.toLowerCase().includes(filterText) ||
        prof.location?.toLowerCase().includes(filterText) ||
        prof.bio?.toLowerCase().includes(filterText);
      
      // Location filter  
      const matchesLocation = !filters.location || filters.location === 'all' || 
        prof.location?.toLowerCase() === filters.location.toLowerCase() ||
        prof.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      // Skills filter
      const matchesSkills = filters.skills.length === 0 ||
        filters.skills.some(skill => 
          prof.skills?.some(profSkill => 
            profSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      
      return matchesText && matchesLocation && matchesSkills;
    });

    const filteredCommunities = demoCommunities.filter(comm => {
      return !searchTerm || 
        comm.name.toLowerCase().includes(filterText) ||
        comm.description.toLowerCase().includes(filterText) ||
        comm.category.toLowerCase().includes(filterText);
    });

    const filteredEvents = demoEvents.filter(event => {
      return !searchTerm || 
        event.title.toLowerCase().includes(filterText) ||
        event.description?.toLowerCase().includes(filterText) ||
        event.location?.toLowerCase().includes(filterText);
    });

    return {
      professionals: filteredProfessionals,
      communities: filteredCommunities,
      events: filteredEvents
    };
  }, [searchTerm, filters]);

  const handleConnect = (professionalId: string) => {
    console.log('Connect with professional:', professionalId);
  };

  const handleMessage = (recipientId: string, recipientName: string) => {
    console.log('Message professional:', recipientId, recipientName);
  };

  const handleJoinCommunity = () => {
    console.log('Join community');
  };

  const handleRegisterEvent = () => {
    console.log('Register for event');
  };

  const getConnectionStatus = (professionalId: string) => {
    return { status: 'not_connected' };
  };

  const handleRefresh = () => {
    console.log('Refresh data');
  };

  const handleSearch = () => {
    // Search happens automatically via real-time filtering in useMemo
    console.log('Real-time search active:', searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PrototypeNotice />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="sticky top-16 z-20 bg-gray-50 pb-2 pt-2 border-b border-gray-200">
          <SearchSection
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            onClearSearch={handleClearSearch}
            loading={false}
            filters={filters}
            onFiltersChange={setFilters}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            resultCounts={{
              professionals: filteredData.professionals.length,
              communities: filteredData.communities.length,
              events: filteredData.events.length
            }}
          />
        </div>
        <ConnectTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          professionals={filteredData.professionals}
          communities={filteredData.communities}
          events={filteredData.events}
          onConnect={handleConnect}
          onMessage={handleMessage}
          onJoinCommunity={handleJoinCommunity}
          onRegisterEvent={handleRegisterEvent}
          getConnectionStatus={getConnectionStatus}
          isLoggedIn={false}
          onRefresh={handleRefresh}
        />
        <CallToActionSection onFeedbackClick={() => setIsFeedbackPanelOpen(true)} />
      </main>

      <Footer />
      
      <ConnectDialogsManager 
        professionalDialogOpen={professionalDialogOpen}
        selectedProfessional={selectedProfessional}
        onProfessionalDialogChange={setProfessionalDialogOpen}
        onConnect={handleConnect}
        onMessage={handleMessage}
        demoExplanationOpen={demoExplanationOpen}
        onDemoExplanationChange={setDemoExplanationOpen}
      />
      
      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="connect"
      />
    </div>
  );
};

export default ConnectExample;