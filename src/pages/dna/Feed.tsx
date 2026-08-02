import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PenSquare, TrendingUp, Search, Clock, Camera, Calendar, BookOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { SearchDialog } from '@/components/feed/SearchDialog';
import { FeedLensBar, FEED_LENSES } from '@/components/feed/FeedLensBar';
import { MobileProfileCompletionBanner } from '@/components/feed/MobileProfileCompletionBanner';
import { FirstTimeWalkthrough } from '@/components/onboarding/FirstTimeWalkthrough';
import { FeedHeroGreeting } from '@/components/feed/FeedHeroGreeting';
import { FeedLeftPanel } from '@/components/feed/FeedLeftPanel';
import { FeedCommunityPulse } from '@/components/feed/FeedCommunityPulse';
import { FeedColumn } from '@/components/feed/FeedColumn';
import { FeedTab, RankingMode } from '@/types/feed';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useUniversalComposer } from '@/contexts/ComposerContext';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';
import { useHeaderVisibility } from '@/hooks/useHeaderVisibility';
import { useScrollDirection } from '@/hooks/useScrollDirection';
// Adinkra icons reserved for module identity surfaces; feed tabs use lucide.
// Dynamic header spacing replaces hardcoded constants from mobileHeaderSpacing
import { useMobileHeaderHeight } from '@/hooks/useMobileHeaderHeight';
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
  const mobileHeaderRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const mobileHeaderPadding = useMobileHeaderHeight(mobileHeaderRef);
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();
  const { hideHeader: hideUnifiedHeader, showHeader } = useHeaderVisibility();
  const { isScrollingDown, isAtTop } = useScrollDirection(30);
  const headerHidden = isMobile && isScrollingDown && !isAtTop;

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
        
        <div className="min-h-screen bg-background">
          {/* Single measured container for both fixed header rows */}
          <div
            ref={mobileHeaderRef}
            className="fixed top-0 left-0 right-0"
            // BD157: this element owns the notch strip in the installed PWA.
            style={{ zIndex: 50, paddingTop: 'env(safe-area-inset-top, 0px)' }}
          >
            {/* Header row - hides on scroll down */}
            <div className={cn(
              "bg-background transition-all duration-300 overflow-hidden",
              headerHidden ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
            )}>
              <MobileHeader
                variant="feed"
                showSearch={true}
                onSearchClick={() => setShowSearchDialog(true)}
                onComposerClick={() => composer.open('story')}
                className="border-b-0"
              />
            </div>

            {/* Tabs row - always visible */}
            <div className="bg-background border-b border-border">
              <div className="px-3 py-1.5">
                <FeedLensBar />
              </div>
            </div>
          </div>

          {/* Content with dynamic padding from measured header */}
          <main
            className="pb-bottom-nav px-3 space-y-0 transition-[padding] duration-300"
            style={{ paddingTop: mobileHeaderPadding || undefined }}
          >
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
        </div>
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
          </div>

          {/* Sticky header: Composer + Tabs */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 space-y-3">
            {/* Chat-style Composer Bar */}
            <div
              className="flex items-center gap-3 bg-card rounded-full px-3 py-2 shadow-dna-1 border border-border/40 cursor-pointer hover:shadow-dna-2 transition-all duration-200"
              onClick={() => composer.open('story')}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xs">{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm text-muted-foreground">
                What's on your mind?
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); composer.open('story'); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  title="Photo"
                >
                  <Camera className="h-4 w-4 text-dna-convey" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); composer.open('event'); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  title="Event"
                >
                  <Calendar className="h-4 w-4 text-dna-gold" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); composer.open('story'); }}
                  className="p-1.5 rounded-full hover:bg-muted transition-colors"
                  title="Story"
                >
                  <BookOpen className="h-4 w-4 text-dna-copper" />
                </button>
              </div>
            </div>

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
