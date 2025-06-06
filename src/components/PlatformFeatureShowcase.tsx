
import React from 'react';
import HeroTriangleSection from './platform/HeroTriangleSection';
import ConnectSection from './platform/ConnectSection';
import CollaborateSection from './platform/CollaborateSection';
import ContributeSection from './platform/ContributeSection';
import DNACycleSection from './platform/DNACycleSection';
import CTASection from './platform/CTASection';

const PlatformFeatureShowcase = () => {
  return (
    <div className="bg-white">
      <HeroTriangleSection />
      <ConnectSection />
      <CollaborateSection />
      <ContributeSection />
      <DNACycleSection />
      <CTASection />
    </div>
  );
};

export default PlatformFeatureShowcase;
