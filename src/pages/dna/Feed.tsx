import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PenSquare, TrendingUp, Search, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';
import { FeedComposerTeaser } from '@/components/feed/FeedComposerTeaser';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { SearchDialog } from '@/components/feed/SearchDialog';
import { FeedLensBar, FEED_LENSES } from '@/components/feed/FeedLensBar';
import { HubTabsRow } from '@/components/shell/HubTabsRow';
import { MobileProfileCompletionBanner } from '@/components/feed/MobileProfileCompletionBanner';
import { FirstTimeWalkthrough } from '@/components/onboarding/FirstTimeWalkthrough';
import { FeedHeroGreeting } from '@/components/feed/FeedHeroGreeting';
import { FeedLeftPanel } from '@/components/feed/FeedLeftPanel';
import { FeedCommunityPulse } from '@/components/feed/FeedCommunityPulse';
import { FeedColumn } from '@/components/feed/FeedColumn';
import { FeedTab, RankingMode } from '@/types/feed';
import { DnaMobileHubShell } from '@/components/mobile/DnaMobileHubShell';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { useMobile } from '@/hooks/useMobile';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
// Adinkra icons reserved for module identity surfaces; feed tabs use lucide.
import { incrementSessionCount } from '@/services/dia-feed-cadence';
import { useSearchParams } from 'react-router-dom';

// Scroll position storage key
const FEED_SCROLL_KEY = 'dna_feed_scroll_position';

const DnaFeed = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Route-driven: the active lens lives in the URL (?lens=<id>), read here and
  // by the mobile LensBar off the same param. Fall back to the legacy ?tab= key
  // so existing deep links (sidebar "Saved Items", account drawer) still land.
  const lensParam = searchParams.get('lens') ?? searchParams.get('tab');
  const validTabs = FEED_LENSES.map((l) => l.id) as FeedTab[];
  const activeTab: FeedTab = validTabs.includes(lensParam as FeedTab)
    ? (lensParam as FeedTab)
    : 'all';

  const setActiveTab = useCallback(
    (tab: FeedTab) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('lens', tab);
          next.delete('tab');
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  // Migrate a legacy ?tab= deep link to the canonical ?lens= on arrival so the
  // lens bar and the feed content agree. replace:true keeps it out of history.
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && !searchParams.get('lens')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('lens', tab);
          next.delete('tab');
          return next;
        },
        { replace: true },
      );
    }
  }, [searchParams, setSearchParams]);
  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();
  const { hideHeader: hideUnifiedHeader, showHeader } = useHeaderVisibility();

  // Increment session count for DIA cadence engine
  useEffect(() => {
    incrementSessionCount();
  }, []);

  // Hide unified header on mobile feed (has its own header)
  useEffect(() => {
    if (isMobile) {
      hideUnifiedHeader();
      return () => showHeader();
    }
  }, [isMobile, hideUnifiedHeader, showHeader]);

  // Scroll position preservation
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(FEED_SCROLL_KEY);
    if (savedScroll) {
      const scrollY = parseInt(savedScroll, 10);
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
      sessionStorage.removeItem(FEED_SCROLL_KEY);
    }

    const handleBeforeUnload = () => {
      sessionStorage.setItem(FEED_SCROLL_KEY, String(window.scrollY));
    };

    // Save scroll position when navigating away
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Save scroll position on route change (SPA navigation)
  useEffect(() => {
    return () => {
      sessionStorage.setItem(FEED_SCROLL_KEY, String(window.scrollY));
    };
  }, []);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  // Mobile layout with custom header - hide UnifiedHeader
  if (isMobile) {
    return (
      <>
        {/* First-time user walkthrough */}
        <FirstTimeWalkthrough />
        
        <DnaMobileHubShell
          bubble={{
            kind: 'composer',
            placeholder: "What's on your mind?",
            onClick: () => composer.open('story'),
          }}
          tabs={
            <HubTabsRow>
              <FeedLensBar />
            </HubTabsRow>
          }
          contentPadding
        >
          <main className="space-y-0">
            {/* Profile completion banner */}
            <MobileProfileCompletionBanner threshold={100} />
            {activeTab === 'for_you' ? (
              <PersonalizedFeed />
            ) : (
              <UniversalFeedInfinite
                viewerId={user.id}
                tab={activeTab}
                rankingMode={rankingMode}
                emptyMessage={
                  activeTab === 'my_posts'
                    ? "You haven't posted anything yet"
                    : activeTab === 'network'
                    ? "Your connections haven't posted yet"
                    : 'No posts to show'
                }
                emptyAction={
                  <Button
                    onClick={() => composer.open('story')}
                    className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"
                  >
                    <PenSquare className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                }
              />
            )}
          </main>
          <SearchDialog
            isOpen={showSearchDialog}
            onClose={() => setShowSearchDialog(false)}
          />
        </DnaMobileHubShell>
      </>
    );
  }
 
  // Desktop layout - independent scrolling 3-column (like Connect Hub)
  return (
    <div className="bg-background" ref={feedContainerRef}>
      {/* First-time user walkthrough */}
      <FirstTimeWalkthrough />

      {/* Independent scrolling 3-column layout */}
      <div
        className="max-w-7xl mx-auto flex gap-5 px-4"
        style={{
          paddingTop: '1.5rem',
          height: 'calc(100dvh - var(--total-header-height, 7.5rem) - 1.5rem)',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar — "My DNA" Panel */}
        <aside
          className="overflow-y-auto scrollbar-thin shrink-0"
          style={{ width: '260px' }}
        >
          <FeedLeftPanel />
        </aside>

        {/* Center Column — Main Feed */}
        <FeedColumn ref={mainScrollRef}>
          {/* Hero Greeting Zone */}
          <div className="space-y-3 mb-3">
            <FeedHeroGreeting
              onComposerOpen={(mode) => {
                // Map 'post' greeting pill to the story composer since
                // ComposerMode doesn't have a 'post' variant.
                const resolved = mode === 'post' ? 'story' : mode;
                composer.open(resolved as 'event' | 'story');
              }}
            />

            <ProfileCompletionNudge variant="banner" threshold={40} />

            {/* Feed Header + Ranking Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSearchDialog(true)}
                  className="h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Tabs value={rankingMode} onValueChange={(v) => setRankingMode(v as RankingMode)} className="w-auto">
                <TabsList className="h-8 bg-muted/30 rounded-full">
                   <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold">
                     <TrendingUp className="h-3 w-3" />
                     <span>Top</span>
                   </TabsTrigger>
                   <TabsTrigger value="latest" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold">
                     <Clock className="h-3 w-3" />
                     <span>Latest</span>
                   </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Sticky header: Composer + Lens */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 space-y-3">
            {/* Chat-style Composer Bar */}
            <FeedComposerTeaser
              avatarUrl={profile.avatar_url}
              avatarFallback={profile.display_name?.[0] || profile.username?.[0] || 'U'}
              onOpenStory={() => composer.open('story')}
              onOpenEvent={() => composer.open('event')}
            />

            {/* Filter lenses — same primitive, lens definition, and route-driven
                behaviour as mobile. LensBar writes ?lens= itself and collapses
                its descriptor on scroll via useScrollDirection (which resolves
                the FeedColumn scroll region), so this branch no longer manages
                either. */}
            <FeedLensBar />
          </div>

          {/* Feed Content */}
          {activeTab === 'for_you' ? (
            <PersonalizedFeed />
          ) : (
            <UniversalFeedInfinite
              viewerId={user.id}
              tab={activeTab}
              rankingMode={rankingMode}
              emptyMessage={
                activeTab === 'my_posts'
                  ? "You haven't posted anything yet"
                  : activeTab === 'network'
                  ? "Your connections haven't posted yet"
                  : 'No posts to show'
              }
              emptyAction={
                <Button
                  onClick={() => composer.open('story')}
                  className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              }
            />
          )}
        </FeedColumn>

        {/* Right Sidebar — Community Pulse */}
        <aside
          className="overflow-y-auto scrollbar-thin shrink-0"
          style={{ width: '300px' }}
        >
          <FeedCommunityPulse />
        </aside>
      </div>

      <SearchDialog
        isOpen={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
      />
    </div>
  );
};

export default DnaFeed;
