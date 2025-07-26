import React from 'react';
import LinkedInLayout from '@/components/linkedin/LinkedInLayout';
import ProfileCard from '@/components/linkedin/ProfileCard';
import RecentActivity from '@/components/linkedin/RecentActivity';
import PostComposer from '@/components/linkedin/PostComposer';
import NewsAndTrends from '@/components/linkedin/NewsAndTrends';
import CommunityFeed from '@/components/community/CommunityFeed';

const Dashboard = () => {
  const leftSidebar = (
    <div className="space-y-4">
      <ProfileCard />
      <RecentActivity />
    </div>
  );

  const mainContent = (
    <div className="space-y-4">
      <PostComposer />
      <CommunityFeed />
    </div>
  );

  const rightSidebar = (
    <div className="space-y-4">
      <NewsAndTrends />
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