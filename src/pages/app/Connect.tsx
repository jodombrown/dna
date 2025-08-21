import React from 'react';
import NetworkingHub from '@/components/networking/NetworkingHub';
import BetaAccessGate from "@/components/auth/BetaAccessGate";

const Connect = () => {
  return (
    <BetaAccessGate>
      <NetworkingHub />
    </BetaAccessGate>
  );
};

export default Connect;