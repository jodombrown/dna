import React from 'react';
import HeroTriangleSection from './platform/HeroTriangleSection';
import ConnectSection from './platform/ConnectSection';
import ConveneSection from './platform/ConveneSection';
import CollaborateSection from './platform/CollaborateSection';
import ContributeSection from './platform/ContributeSection';
import ConveySection from './platform/ConveySection';

const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      <HeroTriangleSection />
      <ConnectSection />
      <ConveneSection />
      <ConveySection />
      <ContributeSection />
      <CollaborateSection />
    </div>
  );
};

export default PlatformFeatureShowcase;
