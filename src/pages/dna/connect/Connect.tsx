import React, { useState, useCallback, useEffect, useRef } from 'react';
import { messageService } from '@/services/messageService';
import { MESSAGING_ENABLED } from '@/config/featureFlags';
import { useNavigate, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useMobile } from '@/hooks/useMobile';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { cn } from '@/lib/utils';
// Dynamic header spacing replaces hardcoded constants from mobileHeaderSpacing
import { useMobileHeaderHeight } from '@/hooks/useMobileHeaderHeight';

// New Hub Components
import {
  ConnectHubLayout,
  NetworkPanel,
  DiscoveryFeed,
  ConversationsPanel,
  InlineChat,
  FilterState,
} from '@/components/connect/hub';

// Mobile components

import { ConnectMobileTabs, ConnectMobileTopBar, type ConnectTab } from '@/components/connect/ConnectMobileHeader';

// Diaspora density map — rendered in-shell as the Map tab (mobile) / right
// column (desktop). The same component also backs the standalone
// /dna/connect/map route; `inShell` suppresses its page-level heading here.
import { DiasporaDensityMap } from '@/components/maps/DiasporaDensityMap';

// DIA Card System (Sprint 4A)
import { DIAHubSection } from '@/components/dia/DIAHubSection';

// Cultural pattern overlay
import { CulturalPattern } from '@/components/shared/CulturalPattern';

/**
 * Connect Hub - Reimagined Three-Column Architecture
 *
 * Desktop (>1024px): Three-column layout with NetworkPanel, DiscoveryFeed, ConversationsPanel
 * Mobile (<768px): Uses Outlet to render child routes with mobile header
 */
const Connect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const { isMobile } = useMobile();
  const { isScrollingDown, isAtTop } = useScrollDirection(30);
  const { hideHeader: hideUnifiedHeader, showHeader } = useHeaderVisibility();
  const headerHidden = isMobile && isScrollingDown && !isAtTop;
  const connectHeaderRef = useRef<HTMLDivElement>(null);
  const connectHeaderPadding = useMobileHeaderHeight(connectHeaderRef);

  // Hide unified header on mobile connect (has its own header)
  useEffect(() => {
    if (isMobile) {
      hideUnifiedHeader();
      return () => showHeader();
    }
  }, [isMobile, hideUnifiedHeader, showHeader]);

  // Hub state - always declare all hooks regardless of mobile/desktop
  const [expandedChat, setExpandedChat] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    cEngagement: 'all',
    regions: [],
    diasporaLocations: [],
  });
  const [networkSearchQuery, setNetworkSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'discover' | 'network' | 'activity'>('discover');

  // Mobile state
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileActiveFilterCount, setMobileActiveFilterCount] = useState(0);

  // Determine mobile view from URL path (back-compat: existing deep links like
  // /dna/connect/network still light the right lens before ?lens= is written).
  const getMobileViewFromPath = (): 'network' | 'discover' | 'messages' => {
    if (location.pathname.includes('/network')) return 'network';
    if (location.pathname.includes('/messages')) return 'messages';
    return 'discover';
  };
  const mobileView = getMobileViewFromPath();

  // Route-driven lens (BD332b): the active lens lives in the URL (?lens=<id>),
  // read here and by the mobile LensBar off the same param — no tab state. Map
  // renders in-shell (it has no route of its own); discover/network are child
  // routes kept in step with the lens by the effect below. When ?lens= is
  // absent we fall back to the path so legacy deep links still resolve.
  const CONNECT_LENS_IDS = ['discover', 'network', 'map', 'messages'];
  const lensParam = searchParams.get('lens');
  const activeLens: ConnectTab =
    lensParam && CONNECT_LENS_IDS.includes(lensParam)
      ? (lensParam as ConnectTab)
      : mobileView;

  // Keep the URL lens and the child route in agreement on mobile.
  useEffect(() => {
    if (!isMobile) return;
    const lens = searchParams.get('lens');
    if (!lens) {
      // Migrate a path-only deep link to carry ?lens= so the bar agrees with the
      // content without a redirect. Map has no route to migrate from.
      if (mobileView === 'network' || mobileView === 'discover') {
        setSearchParams(
          (prev) => {
            const next = new URLSearchParams(prev);
            next.set('lens', mobileView);
            return next;
          },
          { replace: true },
        );
      }
      return;
    }
    // A routed lens drives a real navigation; Map stays in-shell and Messages is
    // disabled, so neither moves the path.
    if (lens === 'network' && mobileView !== 'network') {
      navigate('/dna/connect/network?lens=network', { replace: true });
    } else if (lens === 'discover' && mobileView !== 'discover') {
      navigate('/dna/connect/discover?lens=discover', { replace: true });
    }
  }, [isMobile, searchParams, mobileView, navigate, setSearchParams]);

  // Handle filter changes from NetworkPanel
  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // When filters change, switch to discover mode to show filtered results
    setViewMode('discover');
  }, []);

  // Handle view mode changes from NetworkPanel
  const handleViewModeChange = useCallback((mode: 'discover' | 'network' | 'activity') => {
    setViewMode(mode);
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

  // Handle message member from discovery feed or DIA cards — open inline chat
  const handleMessageMember = useCallback(async (memberId: string) => {
    // BD063 hide-and-freeze: DM messaging is OUT at v0.0 — do not open a conversation.
    if (!MESSAGING_ENABLED) return;
    try {
      const conversation = await messageService.getOrCreateConversation(memberId);
      setSelectedConversationId(conversation.id);
      setExpandedChat(true);
    } catch {
      // Fallback: just expand the chat panel
      setExpandedChat(true);
    }
  }, []);

  // Close inline chat
  const handleCloseChat = useCallback(() => {
    setExpandedChat(false);
    setSelectedConversationId(null);
  }, []);

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

  // Mobile view - use Outlet for child routes to prevent hook count issues
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background pb-bottom-nav overflow-x-hidden">
        {/* Single measured container for fixed header */}
        <div
          ref={connectHeaderRef}
          className="fixed top-0 left-0 right-0"
          // BD157
          style={{ zIndex: 50, paddingTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <div className={cn(
            "bg-background transition-all duration-300 overflow-hidden",
            headerHidden ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
          )}>
            <ConnectMobileTopBar
              searchQuery={mobileSearchQuery}
              onSearchChange={setMobileSearchQuery}
              onFiltersClick={() => setShowMobileFilters(true)}
              activeFilterCount={mobileActiveFilterCount}
            />
          </div>
          {/* Tabs row - always visible (matches Feed behavior) */}
          <ConnectMobileTabs />
        </div>

        {/* Mobile Content - dynamic padding from measured header */}
        <div
          className="px-3 sm:px-4 overflow-x-hidden transition-[padding] duration-300"
          style={{ paddingTop: connectHeaderPadding || undefined }}
        >
          {activeLens === 'map' ? (
            <DiasporaDensityMap inShell />
          ) : (
            <Outlet context={{
              mobileSearchQuery,
              showMobileFilters,
              setShowMobileFilters,
              setMobileActiveFilterCount,
            }} />
          )}
        </div>

        
      </div>
    );
  }

  // Desktop/Tablet: Three-column layout
  return (
    <div className="relative bg-background">
      {/* Kente pattern at 5% opacity behind all content */}
      <CulturalPattern pattern="kente" opacity={0.05} className="z-0" />
      <div className="relative z-10">
      <ConnectHubLayout
        leftPanel={
          <div className="space-y-4">
            <DIAHubSection surface="connect_hub" limit={2} onMessageUser={handleMessageMember} />
            <NetworkPanel
              onFilterChange={handleFilterChange}
              onSearchChange={handleNetworkSearch}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        }
        centerPanel={
          <DiscoveryFeed
            filters={filters}
            networkSearchQuery={networkSearchQuery}
            onMessageMember={handleMessageMember}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        }
        rightPanel={
          /* BD063 hide-and-freeze: while messaging is OUT at v0.0 the DM column
             (conversations list + inline chat) is frozen; the Diaspora Map takes
             its place as the Connect Map tab's desktop column. Frozen messaging
             components stay in the tree for when the flag flips back on. */
          !MESSAGING_ENABLED ? (
            <DiasporaDensityMap inShell />
          ) : (
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
          )
        }
        expandedChat={expandedChat}
        onChatExpand={handleChatExpand}
      />
      </div>
    </div>
  );
};

export default Connect;
