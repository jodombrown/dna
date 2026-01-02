// src/components/hubs/convey/ConveyAspiration.tsx
// Aspiration mode for Convey hub (Stories)

import React, { useState } from 'react';
import { AspirationMode } from '../shared/AspirationMode';
import { NotifyMeModal } from '../shared/NotifyMeModal';
import { HostApplicationModal } from '../shared/HostApplicationModal';
import { ConveyIllustration } from '../shared/HubIllustrations';
import { useHubMode } from '@/hooks/useHubMode';
import { Bell, Pencil } from 'lucide-react';

interface ConveyAspirationProps {
  earlyContent?: React.ReactNode;
}

export function ConveyAspiration({ earlyContent }: ConveyAspirationProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const { contentCount, threshold, progress } = useHubMode('convey');

  const comingSoonFeatures = [
    'Long-form stories and essays',
    'Professional insights and thought leadership',
    'Community spotlights and features',
    'Event recaps and coverage',
    'Multimedia content series',
    'Diaspora success stories'
  ];

  return (
    <>
      <AspirationMode
        hub="convey"
        illustration={<ConveyIllustration className="w-full h-full" />}
        title="CONVEY"
        tagline="Amplify Our Story"
        description="Our stories deserve to be heard. DNA Convey is where diaspora voices share insights, celebrate wins, spark conversations, and shape the narrative of African excellence worldwide. Your perspective matters here."
        primaryCTA={{
          label: 'Notify Me When Publishing Opens',
          icon: <Bell className="w-4 h-4 mr-2" />,
          onClick: () => setShowNotifyModal(true)
        }}
        secondaryCTA={{
          label: 'Apply for Early Creator Access',
          icon: <Pencil className="w-4 h-4 ml-2" />,
          onClick: () => setShowHostModal(true)
        }}
        comingSoon={comingSoonFeatures}
        earlyContent={earlyContent}
        pattern="adinkra"
      />

      <NotifyMeModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        hub="convey"
      />

      <HostApplicationModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        hub="convey"
      />
    </>
  );
}

export default ConveyAspiration;
