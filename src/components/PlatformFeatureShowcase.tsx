
import React from 'react';
import ConnectSection from './platform/ConnectSection';
import CollaborateSection from './platform/CollaborateSection';
import ContributeSection from './platform/ContributeSection';
const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      <ConnectSection />
      <CollaborateSection />
      <ContributeSection />
    </div>
  );
};

export default PlatformFeatureShowcase;
