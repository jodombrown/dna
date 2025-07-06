import React from 'react';
import AppSidebar from './AppSidebar';
import FeedSection from './FeedSection';
import RightSidebar from './RightSidebar';

const AppLayout = () => {
  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <div className="h-full overflow-y-auto p-4">
          <AppSidebar />
        </div>
      </div>
      
      {/* Main Feed */}
      <div className="flex-1 min-w-0">
        <div className="h-full overflow-y-auto p-4">
          <FeedSection />
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-80 flex-shrink-0 hidden xl:block">
        <div className="h-full overflow-y-auto p-4">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;