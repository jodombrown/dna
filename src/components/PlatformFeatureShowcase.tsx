
import React from 'react';
import HeroTriangleSection from './platform/HeroTriangleSection';
import ConnectSection from './platform/ConnectSection';
import CollaborateSection from './platform/CollaborateSection';
import ContributeSection from './platform/ContributeSection';
const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      <HeroTriangleSection />
      <ConnectSection />
      <CollaborateSection />
      <ContributeSection />
    </div>
  );
};

export default PlatformFeatureShowcase;
