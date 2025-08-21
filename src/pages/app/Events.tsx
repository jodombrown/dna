import React from 'react';
import CommunityHub from '@/components/community/CommunityHub';
import BetaAccessGate from '@/components/auth/BetaAccessGate';

const Events = () => {
  return (
    <BetaAccessGate>
      <CommunityHub />
    </BetaAccessGate>
  );
};

export default Events;