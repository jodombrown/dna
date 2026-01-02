// src/pages/dna/convey/ConveyHub.tsx
// Convey Hub with Dual-Mode Architecture

import React from 'react';
import { HubModeSwitch } from '@/components/hubs/shared';
import { ConveyAspiration } from '@/components/hubs/convey';
import { ConveyDiscovery } from './ConveyDiscovery';

export default function ConveyHub() {
  return (
    <HubModeSwitch
      hub="convey"
      aspirationComponent={<ConveyAspiration />}
      discoveryComponent={<ConveyDiscovery />}
    />
  );
}
