// src/components/hubs/contribute/ContributeAspiration.tsx
// Aspiration mode for Contribute hub (Marketplace)

import React, { useState } from 'react';
import { AspirationMode } from '../shared/AspirationMode';
import { NotifyMeModal } from '../shared/NotifyMeModal';
import { HostApplicationModal } from '../shared/HostApplicationModal';
import { ContributeIllustration } from '../shared/HubIllustrations';
import { Bell, FileEdit } from 'lucide-react';

interface ContributeAspirationProps {
  earlyContent?: React.ReactNode;
}

export function ContributeAspiration({ earlyContent }: ContributeAspirationProps) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [showHostModal, setShowHostModal] = useState(false);

  const comingSoonFeatures = [
    'Job and contract opportunities',
    'Investment and funding needs',
    'Mentorship and advisory requests',
    'Skills and services exchange',
    'Resource and equipment sharing',
    'Volunteer opportunities'
  ];

  return (
    <>
      <AspirationMode
        hub="contribute"
        illustration={<ContributeIllustration className="w-full h-full" />}
        title="CONTRIBUTE"
        tagline="Give What You Have, Get What You Need"
        description="The diaspora's power lies in what we can exchange: time, knowledge, networks, and opportunities. DNA's marketplace connects those who can give with those who need, creating value that stays within our community."
        primaryCTA={{
          label: 'Notify Me When Marketplace Opens',
          icon: <Bell className="w-4 h-4 mr-2" />,
          onClick: () => setShowNotifyModal(true)
        }}
        secondaryCTA={{
          label: 'Post an Opportunity Early',
          icon: <FileEdit className="w-4 h-4 ml-2" />,
          onClick: () => setShowHostModal(true)
        }}
        comingSoon={comingSoonFeatures}
        earlyContent={earlyContent}
        pattern="mudcloth"
      />

      <NotifyMeModal
        isOpen={showNotifyModal}
        onClose={() => setShowNotifyModal(false)}
        hub="contribute"
      />

      <HostApplicationModal
        isOpen={showHostModal}
        onClose={() => setShowHostModal(false)}
        hub="contribute"
      />
    </>
  );
}

export default ContributeAspiration;
