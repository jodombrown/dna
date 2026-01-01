import React from 'react';
import { useViewState } from '@/contexts/ViewStateContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import UnifiedHeader from '@/components/UnifiedHeader';
import { AccountDrawer } from '@/components/navigation/AccountDrawer';
import { FeedbackFAB } from '@/components/feedback/FeedbackFAB';
import { PulseBar } from '@/components/pulse';

interface BaseLayoutProps {
  children: React.ReactNode;
}

/**
 * BaseLayout - The intelligent layout wrapper that adapts based on view state
 * 
 * This component automatically applies the correct layout configuration
 * based on the current view state (determined by the route).
 * 
 * Features:
 * - Smooth transitions between layout configurations (300ms)
 * - Responsive behavior for mobile/tablet/desktop
 * - Preserves context across view state changes
 */
const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const { viewState, layoutConfig } = useViewState();
  const { user } = useAuth();
  const location = useLocation();

  // Unique gradient for each of the 5 Cs + Feed when logged in
  // All using DNA brand colors: mint, terra, ochre, sunset, purple, copper
  const getAuthGradient = () => {
    if (!user) return "bg-background";
    
    const path = location.pathname;
    
    // Feed - DNA mint green
    if (path.includes('/feed')) {
      return "bg-gradient-to-br from-dna-mint/20 via-background to-dna-mint/10";
    }
    
    // Connect - Cultural warmth (terra/ochre)
    if (path.includes('/connect') || path.includes('/network') || path.includes('/discover')) {
      return "bg-gradient-to-br from-dna-terra/15 via-background to-dna-ochre/10";
    }
    
    // Convene - Sunset celebration (orange/purple)
    if (path.includes('/convene') || path.includes('/events')) {
      return "bg-gradient-to-br from-dna-sunset/15 via-background to-dna-purple/10";
    }
    
    // Collaborate - Earth to mint (terra/mint growth)
    if (path.includes('/collaborate') || path.includes('/spaces')) {
      return "bg-gradient-to-br from-dna-terra/15 via-background to-dna-mint/10";
    }
    
    // Contribute - Copper warmth (copper/ochre)
    if (path.includes('/contribute') || path.includes('/impact') || path.includes('/opportunities')) {
      return "bg-gradient-to-br from-dna-copper/15 via-background to-dna-ochre/10";
    }
    
    // Convey - Royal storytelling (purple/sunset)
    if (path.includes('/convey')) {
      return "bg-gradient-to-br from-dna-purple/15 via-background to-dna-sunset/10";
    }
    
    // Default - DNA mint green
    return "bg-gradient-to-br from-dna-mint/20 via-background to-dna-copper/10";
  };
  
  return (
    <>
      <UnifiedHeader />
      <AccountDrawer />
      <PulseBar />
      <div
        className={cn(
          "min-h-screen w-full max-w-full",
          getAuthGradient(),
          "pt-14 sm:pt-16",
          "transition-all duration-300 ease-in-out",
          "overflow-x-hidden"
        )}
        data-view-state={viewState}
        data-layout-type={layoutConfig.type}
      >
        {children}
      </div>
      <FeedbackFAB />
    </>
  );
};

export default BaseLayout;
