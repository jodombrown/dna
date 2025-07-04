import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import ConnectTabs from '@/components/connect/ConnectTabs';
import ConnectDialogsManager from '@/components/connect/ConnectDialogsManager';
import FeedbackPanel from '@/components/FeedbackPanel';
import PrototypeNotice from '@/components/connect/PrototypeNotice';
import CallToActionSection from '@/components/connect/CallToActionSection';
import { demoProfessionals, demoCommunities, demoEvents } from '@/data/demoSearchData';
import { Professional } from '@/types/search';

const ConnectExample = () => {
  useScrollToTop();
  
  const [isFeedbackPanelOpen, setIsFeedbackPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('professionals');
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [professionalDialogOpen, setProfessionalDialogOpen] = useState(false);
  const [demoExplanationOpen, setDemoExplanationOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    location: '',
    skills: [],
    isMentor: false,
    isInvestor: false,
    lookingForOpportunities: false
  });


  // Filter logic without search
  const filteredData = useMemo(() => {
    const filteredProfessionals = demoProfessionals.filter(prof => {
      // Location filter
      const matchesLocation = !filters.location || filters.location === 'all' || 
        prof.location?.includes(filters.location);
      
      // Skills filter
      const matchesSkills = filters.skills.length === 0 ||
        filters.skills.some(skill => 
          prof.skills?.some(profSkill => 
            profSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
      
      return matchesLocation && matchesSkills;
    });

    return {
      professionals: filteredProfessionals,
      communities: demoCommunities,
      events: demoEvents
    };
  }, [filters]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <PrototypeNotice />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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