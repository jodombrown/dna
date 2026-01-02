// src/components/hubs/convene/ConveneAspiration.tsx
// Aspiration mode for Convene hub (Events)

import React, { useState } from 'react';
import { AspirationMode } from '../shared/AspirationMode';
import { NotifyMeModal } from '../shared/NotifyMeModal';
import { HostApplicationModal } from '../shared/HostApplicationModal';
import { ConveneIllustration } from '../shared/HubIllustrations';
import { useHubMode } from '@/hooks/useHubMode';
import { Bell, Hand } from 'lucide-react';

interface ConveneAspirationProps {
  earlyContent?: React.ReactNode;
}

export function ConveneAspiration({ earlyContent }: ConveneAspirationProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);
  const { contentCount, threshold, progress } = useHubMode('convene');

  const comingSoonFeatures = [
    'Virtual Pan-African summits',
    'City chapter meetups',
    'Professional skill workshops',
    'Investment and funding forums',
    'Cultural celebration events',
    'Industry networking sessions'
  ];

  return (
    <>
      <AspirationMode
        hub="convene"
        illustration={<ConveneIllustration className="w-full h-full" />}
        title="CONVENE"
        tagline="Where the Diaspora Gathers"
        description="From Lagos to London, Atlanta to Accra — DNA events bring our community together for learning, networking, and lasting impact. Virtual summits, city meetups, skill workshops, and investment forums are coming soon."
        primaryCTA={{
          label: 'Notify Me When Events Launch',
          icon: <Bell className="w-4 h-4 mr-2" />,
          onClick: () => setShowNotifyModal(true)
        }}
        secondaryCTA={{
          label: 'Apply to Host an Event',
          icon: <Hand className="w-4 h-4 ml-2" />,
          onClick: () => setShowHostModal(true)
        }}
        comingSoon={comingSoonFeatures}
        earlyContent={earlyContent}
        pattern="kente"
      />

      <NotifyMeModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        hub="convene"
      />

      <HostApplicationModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        hub="convene"
      />
    </>
  );
}

export default ConveneAspiration;
