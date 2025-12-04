import React from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Network, MessageSquare } from 'lucide-react';
import { ProfileStrengthCard } from '@/components/profile/ProfileStrengthCard';
import { calculateProfileCompletion } from '@/components/profile/ProfileCompletionBar';
import { TYPOGRAPHY } from '@/lib/typography.config';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Connect = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  // Determine active tab from current path
  const getActiveTab = () => {
    if (location.pathname.includes('/discover')) return 'discover';
    if (location.pathname.includes('/network')) return 'network';
    if (location.pathname.includes('/messages')) return 'messages';
    return 'discover'; // Default
  };

  const activeTab = getActiveTab();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const completionScore = calculateProfileCompletion(profile);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-8 max-w-7xl">
        {/* Header with Profile Strength */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <h1 className={`${TYPOGRAPHY.h1} mb-2`}>
              Connect
            </h1>
            <p className={TYPOGRAPHY.body}>
              Discover, connect, and engage with your network
            </p>
          </div>
          
          <div className="hidden lg:block w-80">
            <ProfileStrengthCard completionScore={completionScore} compact />
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} className="mb-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 gap-2">
            <TabsTrigger 
              value="discover"
              onClick={() => navigate('/dna/connect/discover')}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span>Discover</span>
            </TabsTrigger>
            <TabsTrigger 
              value="network"
              onClick={() => navigate('/dna/connect/network')}
              className="flex items-center gap-2"
            >
              <Network className="h-4 w-4" />
              <span>Network</span>
            </TabsTrigger>
            <TabsTrigger 
              value="messages"
              onClick={() => navigate('/dna/messages')}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab Content */}
        <div>
          <Outlet />
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Connect;
