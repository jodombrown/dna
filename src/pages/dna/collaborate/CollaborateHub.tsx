// src/pages/dna/collaborate/CollaborateHub.tsx
// Collaborate Hub with Dual-Mode Architecture

import React from 'react';
import { HubModeSwitch } from '@/components/hubs/shared';
import { CollaborateAspiration } from '@/components/hubs/collaborate';
import { CollaborateDiscovery } from './CollaborateDiscovery';

export default function CollaborateHub() {
  return (
    <HubModeSwitch
      hub="collaborate"
      aspirationComponent={<CollaborateAspiration />}
      discoveryComponent={<CollaborateDiscovery />}
    />
  );
}
