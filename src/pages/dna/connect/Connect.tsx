import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';

import { Users, Network, MessageSquare } from 'lucide-react';
import { ProfileStrengthCard } from '@/components/profile/ProfileStrengthCard';
import { calculateProfileCompletion } from '@/components/profile/ProfileCompletionBar';
import { TYPOGRAPHY } from '@/lib/typography.config';
import { ConnectTabExplainer, ConnectTab } from '@/components/connect/ConnectTabExplainer';
import { DiaContextual } from '@/components/dia';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { ConnectMobileHeader } from '@/components/connect/ConnectMobileHeader';

const TAB_CONFIG: { value: ConnectTab; icon: React.ElementType; label: string; route: string }[] = [
  { value: 'discover', icon: Users, label: 'Discover', route: '/dna/connect/discover' },
  { value: 'network', icon: Network, label: 'Network', route: '/dna/connect/network' },
  { value: 'messages', icon: MessageSquare, label: 'Messages', route: '/dna/messages' },
];

const Connect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { isMobile } = useMobile();

  // Mobile header state - MUST be before any conditional returns
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileActiveFilterCount, setMobileActiveFilterCount] = useState(0);

  // Determine active tab from current path
  const getActiveTab = (): ConnectTab => {
    if (location.pathname.includes('/discover')) return 'discover';
    if (location.pathname.includes('/network')) return 'network';
    if (location.pathname.includes('/messages')) return 'messages';
    return 'discover'; // Default
  };

  const activeTab = getActiveTab();

  const handleMobileTabChange = (tab: ConnectTab) => {
    const tabConfig = TAB_CONFIG.find(t => t.value === tab);
    if (tabConfig) {
      navigate(tabConfig.route);
    }
  };

  // Calculate completion score with fallback for loading/missing profile
  const completionScore = profile ? calculateProfileCompletion(profile) : 0;

  // Loading and auth checks AFTER all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Hide BaseLayout's UnifiedHeader for mobile connect - matches Feed pattern */}
      <style>{`
        body:has([data-mobile-connect="true"]) header[data-unified-header] {
          display: none !important;
        }
        body:has([data-mobile-connect="true"]) > div > div {
          padding-top: 0 !important;
        }
      `}</style>
      
      {/* Mobile-only Fixed Header + Tabs Container - matches Feed architecture */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-background" data-mobile-connect="true">
          <ConnectMobileHeader
            activeTab={activeTab}
            onTabChange={handleMobileTabChange}
            searchQuery={mobileSearchQuery}
            onSearchChange={setMobileSearchQuery}
            onFiltersClick={() => setShowMobileFilters(true)}
            activeFilterCount={mobileActiveFilterCount}
          />
        </div>
      )}

      {/* Add top padding to account for fixed header height on mobile */}
      <div className={cn(
        "container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 max-w-7xl",
        isMobile && "pt-[8rem]" // Account for fixed header + tabs
      )}>
        {/* Main layout with sidebar */}
        <div className="flex flex-col lg:flex-row lg:gap-8">
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Header with Profile Strength - Desktop only */}
            <div className="hidden md:flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 lg:mb-8 gap-4">
              <div className="flex-1 min-w-0">
                <h1 className={`${TYPOGRAPHY.h1} mb-2`}>
                  Connect
                </h1>
                <p className={TYPOGRAPHY.body}>
                  Discover members, grow your network, and start conversations
                </p>
              </div>

              <div className="hidden lg:hidden lg:w-80 shrink-0">
                <ProfileStrengthCard completionScore={completionScore} compact />
              </div>
            </div>

            {/* Navigation Tabs - Desktop only */}
            <div className="hidden md:block mb-4">
              <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg">
                {TAB_CONFIG.map(({ value, icon: Icon, label, route }) => {
                  const isActive = activeTab === value;

                  return (
                    <button
                      key={value}
                      onClick={() => navigate(route)}
                      className={cn(
                        "flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isActive
                          ? "bg-background shadow-sm flex-1 px-3"
                          : "px-3 text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                      {isActive && (
                        <span className="text-xs font-medium truncate">{label}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Explainer - Desktop only */}
            <div className="hidden md:block">
              <ConnectTabExplainer activeTab={activeTab} />
            </div>

            {/* Tab Content */}
            <div>
              <Outlet context={{ mobileSearchQuery, showMobileFilters, setShowMobileFilters, setMobileActiveFilterCount }} />
            </div>
          </div>

          {/* Right Sidebar - Desktop only */}
          <div className="hidden lg:block lg:w-80 shrink-0 space-y-6">
            {/* Profile Strength Card */}
            <ProfileStrengthCard completionScore={completionScore} compact />

            {/* DIA Contextual for CONNECT */}
            <DiaContextual
              pillar="connect"
              collapsed={false}
              compact
            />
          </div>
        </div>
      </div>

      {/* DIA floating button removed - feature not fully functional */}

      <MobileBottomNav />
    </div>
  );
};

export default Connect;
