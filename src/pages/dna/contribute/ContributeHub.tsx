// src/pages/dna/contribute/ContributeHub.tsx
// Contribute Hub with Dual-Mode Architecture

import React from 'react';
import { HubModeSwitch } from '@/components/hubs/shared';
import { ContributeAspiration } from '@/components/hubs/contribute';
import { ContributeDiscovery } from './ContributeDiscovery';

const ContributeHub = () => {
  return (
    <HubModeSwitch
      hub="contribute"
      aspirationComponent={<ContributeAspiration />}
      discoveryComponent={<ContributeDiscovery />}
    />
  );
};

export default ContributeHub;
