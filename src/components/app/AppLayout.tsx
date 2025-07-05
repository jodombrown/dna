import React from 'react';
import AppSidebar from './AppSidebar';
import FeedSection from './FeedSection';
import RightSidebar from './RightSidebar';

const AppLayout = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <AppSidebar />
        <FeedSection />
        <RightSidebar />
      </div>
    </div>
  );
};

export default AppLayout;