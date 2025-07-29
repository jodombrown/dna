import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '../Header';
import LinkedInHeader from '../linkedin/LinkedInHeader';

const MobileFriendlyHeader = () => {
  const { user } = useAuth();

  // Show appropriate header based on auth state
  if (user) {
    return <LinkedInHeader />;
  }

  return <Header />;
};

export default MobileFriendlyHeader;