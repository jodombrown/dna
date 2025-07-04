
import React from 'react';
import CollaborationsPageWrapper from '@/components/collaborations/CollaborationsPageWrapper';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import MobilePageNavigation from '@/components/ui/mobile-page-navigation';

const CollaborationsExample = () => {
  useScrollToTop();
  
  return (
    <>
      <CollaborationsPageWrapper />
      <MobilePageNavigation currentPage="collaborate" />
    </>
  );
};

export default CollaborationsExample;
