import React from 'react';
import AppSidebar from './AppSidebar';
import FeedSection from './FeedSection';
import RightSidebar from './RightSidebar';
import MobileSectionWrapper from '@/components/ui/mobile-section-wrapper';

const AppLayout = () => {
  return (
    <MobileSectionWrapper padding="md" fullWidth>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <AppSidebar />
        <FeedSection />
        <RightSidebar />
      </div>
    </MobileSectionWrapper>
  );
};

export default AppLayout;