// src/components/hubs/shared/HubModeSwitch.tsx
// Wrapper component that switches between Aspiration and Discovery modes

import React from 'react';
import { useHubMode, HubType } from '@/hooks/useHubMode';
import { Loader2 } from 'lucide-react';

interface HubModeSwitchProps {
  hub: HubType;
  aspirationComponent: React.ReactNode;
  discoveryComponent: React.ReactNode;
  hybridComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function HubModeSwitch({
  hub,
  aspirationComponent,
  discoveryComponent,
  hybridComponent,
  loadingComponent
}: HubModeSwitchProps) {
  const { mode, isLoading } = useHubMode(hub);

  if (isLoading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-dna-emerald" />
      </div>
    );
  }

  switch (mode) {
    case 'discovery':
      return <>{discoveryComponent}</>;
    case 'hybrid':
      return <>{hybridComponent || aspirationComponent}</>;
    case 'aspiration':
    default:
      return <>{aspirationComponent}</>;
  }
}

export default HubModeSwitch;
