import React from 'react';
import LinkedInLayout from '@/components/linkedin/LinkedInLayout';
import ProfileCard from '@/components/linkedin/ProfileCard';
import PostComposer from '@/components/linkedin/PostComposer';
import { PillarMainContent } from '@/components/linkedin/PillarMainContent';
import CommunityFeed from '@/components/community/CommunityFeed';
import { ConnectSidebar, ContributeSidebar, DiscoverySidebar } from '@/components/linkedin/ThreePillarSidebars';
import { CollaborateSidebar } from '@/components/linkedin/CollaborateSidebar';
import SearchMainContent from '@/components/linkedin/SearchMainContent';
import NetworkMainContent from '@/components/linkedin/NetworkMainContent';
import MessagingMainContent from '@/components/linkedin/MessagingMainContent';
import NotificationsMainContent from '@/components/linkedin/NotificationsMainContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboard } from '@/contexts/DashboardContext';

const Dashboard = () => {
  const { activeView, activePillar, setActivePillar } = useDashboard();

  // Dynamic left sidebar based on active pillar
  const leftSidebar = (
    <div className="space-y-4">
      <ProfileCard />
      
      {/* Four Pillars Navigation */}
      <Tabs value={activePillar} onValueChange={setActivePillar} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed" className="text-xs">Feed</TabsTrigger>
          <TabsTrigger value="connect" className="text-xs">Connect</TabsTrigger>
          <TabsTrigger value="collaborate" className="text-xs">Collaborate</TabsTrigger>
          <TabsTrigger value="contribute" className="text-xs">Contribute</TabsTrigger>
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
      {activeView === 'search' && <SearchMainContent />}
      {activeView === 'network' && <NetworkMainContent />}
      {activeView === 'messaging' && <MessagingMainContent />}
      {activeView === 'notifications' && <NotificationsMainContent />}
      {activeView === 'dashboard' && (
        activePillar === 'feed' ? (
          <>
            <PostComposer />
            <CommunityFeed />
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
      <DiscoverySidebar activePillar={activePillar} />
    </div>
  );

  return (
    <LinkedInLayout
      leftSidebar={leftSidebar}
      mainContent={mainContent}
      rightSidebar={rightSidebar}
    />
  );
};

export default Dashboard;