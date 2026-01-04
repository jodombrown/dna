import React, { useState, useCallback } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

// New Hub Components
import {
  ConnectHubLayout,
  NetworkPanel,
  DiscoveryFeed,
  ConversationsPanel,
  InlineChat,
  FilterState,
} from '@/components/connect/hub';

// Mobile components (legacy support)
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { ConnectMobileHeader } from '@/components/connect/ConnectMobileHeader';

/**
 * Connect Hub - Reimagined Three-Column Architecture
 *
 * PRD: Full-Width Three-Column Layout with Inline DIA Intelligence
 *
 * Desktop (>1024px):
 * - Left (25%): NetworkPanel - Your Network (filters, stats)
 * - Center (50%): DiscoveryFeed - Discovery Feed + DIA Cards
 * - Right (25%): ConversationsPanel - Conversations + Actions
 *
 * When chat is expanded:
 * - Left: 25%
 * - Center: 35%
 * - Right: 40%
 *
 * Tablet (768-1024px): Two columns, messages as slide-over panel
 * Mobile (<768px): Single column with bottom navigation
 */
const Connect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { isMobile } = useMobile();

  // Hub state
  const [expandedChat, setExpandedChat] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    cEngagement: 'all',
    regions: [],
    diasporaLocations: [],
  });
  const [networkSearchQuery, setNetworkSearchQuery] = useState('');

  // Mobile state (legacy support)
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileActiveFilterCount, setMobileActiveFilterCount] = useState(0);
  
  // Determine mobile view from URL path
  const getMobileViewFromPath = (): 'network' | 'discover' | 'messages' => {
    if (location.pathname.includes('/network')) return 'network';
    if (location.pathname.includes('/messages')) return 'messages';
    return 'discover';
  };
  const mobileView = getMobileViewFromPath();

  // Handle filter changes from NetworkPanel
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Handle network search
  const handleNetworkSearch = useCallback((query: string) => {
    setNetworkSearchQuery(query);
  }, []);

  // Handle conversation selection
  const handleSelectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
    setExpandedChat(true);
  }, []);

  // Handle chat expansion toggle
  const handleChatExpand = useCallback((expanded: boolean) => {
    setExpandedChat(expanded);
    if (!expanded) {
      setSelectedConversationId(null);
    }
  }, []);

  // Handle message member from discovery feed
  const handleMessageMember = useCallback((memberId: string) => {
    // This would trigger conversation creation/selection
    // For now, expand the chat panel
    setExpandedChat(true);
  }, []);

  // Close inline chat
  const handleCloseChat = useCallback(() => {
    setExpandedChat(false);
    setSelectedConversationId(null);
  }, []);

  // Mobile tab change
  const handleMobileTabChange = (tab: 'discover' | 'network' | 'messages') => {
    if (tab === 'messages') {
      navigate('/dna/messages');
    } else if (tab === 'network') {
      navigate('/dna/connect/network');
    } else {
      navigate('/dna/connect/discover');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Auth check
  if (!user || !profile) {
    return null;
  }

  // Mobile view with legacy header
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-20">
        {/* Hide BaseLayout's UnifiedHeader for mobile connect */}
        <style>{`
          body:has([data-mobile-connect="true"]) header[data-unified-header] {
            display: none !important;
          }
          body:has([data-mobile-connect="true"]) > div > div {
            padding-top: 0 !important;
          }
        `}</style>

        {/* Mobile Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-40 bg-background" data-mobile-connect="true">
          <ConnectMobileHeader
            activeTab={mobileView}
            onTabChange={handleMobileTabChange}
            searchQuery={mobileSearchQuery}
            onSearchChange={setMobileSearchQuery}
            onFiltersClick={() => setShowMobileFilters(true)}
            activeFilterCount={mobileActiveFilterCount}
          />
        </div>

        {/* Mobile Content */}
        <div className="pt-[8rem] px-4">
          {mobileView === 'network' && (
            <NetworkPanel
              onFilterChange={handleFilterChange}
              onSearchChange={handleNetworkSearch}
            />
          )}
          {mobileView === 'discover' && (
            <DiscoveryFeed
              filters={filters}
              networkSearchQuery={networkSearchQuery}
              onMessageMember={handleMessageMember}
            />
          )}
          {mobileView === 'messages' && (
            <ConversationsPanel
              onSelectConversation={handleSelectConversation}
              selectedConversationId={selectedConversationId}
            />
          )}
        </div>

        <MobileBottomNav />
      </div>
    );
  }

  // Desktop/Tablet: Three-column layout
  return (
    <div className="min-h-screen bg-background">
      <ConnectHubLayout
        leftPanel={
          <NetworkPanel
            onFilterChange={handleFilterChange}
            onSearchChange={handleNetworkSearch}
          />
        }
        centerPanel={
          <DiscoveryFeed
            filters={filters}
            networkSearchQuery={networkSearchQuery}
            onMessageMember={handleMessageMember}
          />
        }
        rightPanel={
          expandedChat && selectedConversationId ? (
            <InlineChat
              conversationId={selectedConversationId}
              onClose={handleCloseChat}
              onMinimize={() => setExpandedChat(false)}
            />
          ) : (
            <ConversationsPanel
              onSelectConversation={handleSelectConversation}
              onExpandChat={() => setExpandedChat(true)}
              selectedConversationId={selectedConversationId}
            />
          )
        }
        expandedChat={expandedChat}
        onChatExpand={handleChatExpand}
      />
    </div>
  );
};

export default Connect;
