
import React from 'react';
import CollaborationsPageWrapper from '@/components/collaborations/CollaborationsPageWrapper';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const CollaborationsExample = () => {
  useScrollToTop();
  
  return <CollaborationsPageWrapper />;
};

export default CollaborationsExample;
