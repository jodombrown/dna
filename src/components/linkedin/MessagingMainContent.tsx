import React from 'react';
import { useMobile } from '@/hooks/useMobile';
import MobileMessagingView from '@/components/mobile/MobileMessagingView';
import { EnhancedMessagingView } from '@/components/messaging/EnhancedMessagingView';

const MessagingMainContent = () => {
  const { isMobile } = useMobile();
  
  // Use mobile-optimized view on mobile devices
  if (isMobile) {
    return <MobileMessagingView />;
  }
  
  return <EnhancedMessagingView />;
};

export default MessagingMainContent;