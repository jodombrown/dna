import React from 'react';
import LinkedInLayout from '@/components/linkedin/LinkedInLayout';
import ProfileCard from '@/components/linkedin/ProfileCard';
import { PillarMainContent } from '@/components/linkedin/PillarMainContent';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ConnectSidebar, ContributeSidebar, DiscoverySidebar } from '@/components/linkedin/ThreePillarSidebars';
import { CollaborateSidebar } from '@/components/linkedin/CollaborateSidebar';
import SearchMainContent from '@/components/linkedin/SearchMainContent';
import NetworkMainContent from '@/components/linkedin/NetworkMainContent';
import MessagingMainContent from '@/components/linkedin/MessagingMainContent';
import NotificationsMainContent from '@/components/linkedin/NotificationsMainContent';
import EnhancedCommunityPulseDashboard from '@/components/metrics/EnhancedCommunityPulseDashboard';
import MobileProfileMainContent from '@/components/mobile/MobileProfileMainContent';

import MobileSettingsView from '@/components/mobile/MobileSettingsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/contexts/DashboardContext';
import { SocialFeedProvider } from '@/contexts/SocialFeedContext';
import { ProfileCompletenessWidget } from '@/components/dashboard/ProfileCompletenessWidget';
import RecommendationsWidget from '@/components/dashboard/RecommendationsWidget';
import ProgressStrip from '@/components/dashboard/ProgressStrip';
import DashboardEventsView from '@/components/events/DashboardEventsView';
const Dashboard = () => {
  const { activeView, setActiveView, activePillar, setActivePillar } = useDashboard();

  // Handle pillar change - always switch to dashboard view when pillar changes
  const handlePillarChange = (pillar: string) => {
    setActivePillar(pillar);
    if (activeView !== 'dashboard') {
      setActiveView('dashboard');
    }
  };

  // Dynamic left sidebar based on active pillar
  const leftSidebar = (
    <div className="space-y-4">
      <ProfileCard />
      
      {/* Four Pillars Navigation */}
      <Tabs value={activePillar} onValueChange={handlePillarChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1 h-auto">
          <TabsTrigger value="feed" className="text-sm font-medium px-2 py-2 whitespace-nowrap">Feed</TabsTrigger>
          <TabsTrigger value="connect" className="text-sm font-medium px-2 py-2 whitespace-nowrap">Connect</TabsTrigger>
          <TabsTrigger value="collaborate" className="text-sm font-medium px-2 py-2 whitespace-nowrap">Collaborate</TabsTrigger>
          <TabsTrigger value="contribute" className="text-sm font-medium px-2 py-2 whitespace-nowrap">Contribute</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="mt-4">
          <ConnectSidebar />
        </TabsContent>
        
        <TabsContent value="connect" className="mt-4">
          <ConnectSidebar />
        </TabsContent>
        
        <TabsContent value="collaborate" className="mt-4">
          <CollaborateSidebar />
        </TabsContent>
        
        <TabsContent value="contribute" className="mt-4">
          <ContributeSidebar />
        </TabsContent>
      </Tabs>
    </div>
  );

  const mainContent = (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="/app/opportunities/new" className="rounded-md border border-border bg-background p-3 text-sm hover:bg-muted transition-colors">Post Update</a>
        <a href="/app/events/new" className="rounded-md border border-border bg-background p-3 text-sm hover:bg-muted transition-colors">Create Event</a>
        <a href="/invite" className="rounded-md border border-border bg-background p-3 text-sm hover:bg-muted transition-colors">Invite a Friend</a>
      </div>

      {/* Feed / Pillar content */}
      <ProgressStrip />
      {activeView === 'search' && <SearchMainContent />}

      {activeView === 'network' && <NetworkMainContent />}
      {activeView === 'messaging' && <MessagingMainContent />}
      {activeView === 'notifications' && <NotificationsMainContent />}
      {activeView === 'profile' && <MobileProfileMainContent />}
      {activeView === 'settings' && <MobileSettingsView />}
      {activeView === 'metrics' && <EnhancedCommunityPulseDashboard />}
      {activeView === 'events' && <DashboardEventsView />}
      {activeView === 'dashboard' && (
        activePillar === 'feed' ? (
          <>
            <CommunityFeed />
            <div className="rounded-md border border-border bg-background p-6 text-sm text-muted-foreground">
              No posts yet? Share your first update.
            </div>
          </>
        ) : (
          <PillarMainContent activePillar={activePillar} />
        )
      )}
    </div>
  );

  // Dynamic right sidebar content based on active pillar
  const rightSidebar = (
    <div className="space-y-4">
      <ProfileCompletenessWidget />
      <RecommendationsWidget />
      <DiscoverySidebar activePillar={activePillar} />
    </div>
  );

  return (
    <SocialFeedProvider>
      <LinkedInLayout
        leftSidebar={activeView === 'events' ? undefined : leftSidebar}
        mainContent={mainContent}
        rightSidebar={activeView === 'events' ? undefined : rightSidebar}
      />
    </SocialFeedProvider>
  );
};

export default Dashboard;