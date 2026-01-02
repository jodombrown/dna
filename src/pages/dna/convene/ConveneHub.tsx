// src/pages/dna/convene/ConveneHub.tsx
// Convene Hub with Dual-Mode Architecture

import React from 'react';
import { HubModeSwitch } from '@/components/hubs/shared';
import { ConveneAspiration } from '@/components/hubs/convene';
import { ConveneDiscovery } from './ConveneDiscovery';

const ConveneHub = () => {
  return (
    <HubModeSwitch
      hub="convene"
      aspirationComponent={<ConveneAspiration />}
      discoveryComponent={<ConveneDiscovery />}
    />
  );
};

export default ConveneHub;
