import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
import MobileMessagingView from '@/components/mobile/MobileMessagingView';
import { EnhancedMessagingView } from '@/components/messaging/EnhancedMessagingView';

const MessagingMainContent = () => {
  const { isMobile } = useMobile();
  
  return (
    <RequireProfileScore min={80} featureName="accessing the messaging system">
      {/* Use mobile-optimized view on mobile devices */}
      {isMobile ? <MobileMessagingView /> : <EnhancedMessagingView />}
    </RequireProfileScore>
  );
};

export default MessagingMainContent;