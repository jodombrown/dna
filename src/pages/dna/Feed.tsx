import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { PenSquare, Sparkles, Users, Newspaper, TrendingUp, Search, Clock } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { SearchDialog } from '@/components/feed/SearchDialog';
import { MobileFeedTabs } from '@/components/feed/MobileFeedTabs';
import { FeedTabExplainer } from '@/components/feed/FeedTabExplainer';
import { MobileProfileCompletionBanner } from '@/components/feed/MobileProfileCompletionBanner';
import { FirstTimeWalkthrough } from '@/components/onboarding/FirstTimeWalkthrough';
import { FeedProfileCard } from '@/components/feed/FeedProfileCard';
import { FeedRightSidebar } from '@/components/feed/FeedRightSidebar';
import { FeedUpcomingEvents } from '@/components/feed/FeedUpcomingEvents';
import { FeedActiveSpaces } from '@/components/feed/FeedActiveSpaces';
import { FeedGreeting } from '@/components/feed/FeedGreeting';
import { NewPostsIndicator } from '@/components/feed/NewPostsIndicator';
import { FeedTab, RankingMode } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useMobile } from '@/hooks/useMobile';
import { incrementSessionCount } from '@/services/dia-feed-cadence';

// Scroll position storage key
const FEED_SCROLL_KEY = 'dna_feed_scroll_position';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();

  // Read initial tab from URL params (e.g., ?tab=bookmarks)
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = (urlParams.get('tab') as FeedTab) || 'all';
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);
  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [tabsVisible, setTabsVisible] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();

  // Increment session count for DIA cadence engine
  useEffect(() => {
    incrementSessionCount();
  }, []);

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

  // Auto-hide tabs while scrolling, reappear 3s after scroll stops
  useEffect(() => {
    if (isMobile) return;
    const el = mainScrollRef.current;
    if (!el) return;

    const onScroll = () => {
      setTabsVisible(false);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setTabsVisible(true), 3000);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [isMobile]);

  // New posts handler
  const handleNewPostsClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNewPostCount(0);
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
        
        {/* Hide BaseLayout's UnifiedHeader for mobile feed */}
        <style>{`
          body:has([data-mobile-feed="true"]) header[data-unified-header] {
            display: none !important;
          }
          body:has([data-mobile-feed="true"]) > div > div {
            padding-top: 0 !important;
          }
        `}</style>
        <div className="min-h-screen bg-background" data-mobile-feed="true">
          {/* Fixed header + profile banner + tabs container (mobile feed only) */}
          <div className="fixed top-0 left-0 right-0 z-40 bg-background">
            <MobileHeader
              variant="feed"
              showSearch={true}
              onSearchClick={() => setShowSearchDialog(true)}
              onComposerClick={() => composer.open('post')}
              className="border-b-0"
            />
            {/* Profile completion banner - above tabs */}
            <MobileProfileCompletionBanner threshold={100} />
            <div className="px-3 pb-1.5 pt-0.5 overflow-x-auto border-b border-border">
              <MobileFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          {/* New Posts Indicator */}
          <NewPostsIndicator count={newPostCount} onClick={handleNewPostsClick} />

          {/* Add top padding to account for fixed header height */}
          <main className="pb-16 px-3 pt-[7.5rem] space-y-1">
            {/* Tab Explainer - shows once per day/login per tab */}
            <FeedTabExplainer activeTab={activeTab} />

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
                    onClick={() => composer.open('post')}
                    className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"
                  >
                    <PenSquare className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                }
              />
            )}
          </main>
          <MobileBottomNav />
          <UniversalComposer
            isOpen={composer.isOpen}
            mode={composer.mode}
            context={composer.context}
            isSubmitting={composer.isSubmitting}
            onClose={composer.close}
            onModeChange={composer.switchMode}
            successData={composer.successData}
            onSubmit={composer.submit}
            onDismissSuccess={composer.dismissSuccess}
          />
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

      {/* New Posts Indicator */}
      <NewPostsIndicator count={newPostCount} onClick={handleNewPostsClick} />

      {/* Independent scrolling 3-column layout */}
      <div
        className="max-w-7xl mx-auto flex gap-5 px-4"
        style={{
          paddingTop: '1.5rem',
          height: 'calc(100vh - 7.5rem)',
          overflow: 'hidden',
        }}
      >
        {/* Left Sidebar - Profile + Cross-C Widgets */}
        <aside
          className="overflow-y-auto scrollbar-thin space-y-4 shrink-0"
          style={{ width: '240px' }}
        >
          <FeedProfileCard />
          <FeedUpcomingEvents />
          <FeedActiveSpaces />
        </aside>

        {/* Center Column - Main Feed */}
        <main
          ref={mainScrollRef}
          className="min-w-0 flex-1 overflow-y-auto scrollbar-thin"
          data-scroll-container="main"
        >
          {/* Non-sticky: scrolls away */}
          <div className="space-y-3 mb-3">
            <FeedGreeting />
            <ProfileCompletionNudge variant="banner" threshold={40} />
          </div>

          {/* Sticky header: Feed title + Composer + Tabs */}
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm pb-2 space-y-3">
            {/* Compact Feed Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">Feed</h1>
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
                <TabsList className="h-8">
                   <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-[hsl(var(--dna-emerald))] data-[state=active]:text-white">
                     <TrendingUp className="h-3 w-3" />
                     <span>Top</span>
                   </TabsTrigger>
                   <TabsTrigger value="latest" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-[hsl(var(--dna-emerald))] data-[state=active]:text-white">
                     <Clock className="h-3 w-3" />
                     <span>Latest</span>
                   </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Compact Create Post Card */}
            <Card
              className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => composer.open('post')}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile.avatar_url || ''} />
                  <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
                  What's on your mind?
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <PenSquare className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Filter Tabs - auto-hide on scroll */}
            <div
              className="transition-all duration-500 ease-in-out overflow-hidden"
              style={{
                maxHeight: tabsVisible ? '48px' : '0px',
                opacity: tabsVisible ? 1 : 0,
              }}
            >
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
                 <TabsList className="w-full grid grid-cols-5 h-10 bg-muted/50 rounded-lg p-1">
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <TabsTrigger value="all" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[hsl(var(--dna-emerald))]">
                         <Newspaper className="h-4 w-4 mr-1.5" />
                         All
                       </TabsTrigger>
                     </TooltipTrigger>
                     <TooltipContent>All posts from across DNA</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <TabsTrigger value="for_you" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[hsl(var(--dna-emerald))]">
                         <Sparkles className="h-4 w-4 mr-1.5" />
                         For You
                       </TabsTrigger>
                     </TooltipTrigger>
                     <TooltipContent>Personalized based on your interests</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <TabsTrigger value="network" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[hsl(var(--dna-emerald))]">
                         <Users className="h-4 w-4 mr-1.5" />
                         Network
                       </TabsTrigger>
                     </TooltipTrigger>
                     <TooltipContent>Posts from your connections</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <TabsTrigger value="my_posts" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[hsl(var(--dna-emerald))]">
                         <PenSquare className="h-4 w-4 mr-1.5" />
                         Mine
                       </TabsTrigger>
                     </TooltipTrigger>
                     <TooltipContent>Your posts and stories</TooltipContent>
                   </Tooltip>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <TabsTrigger value="bookmarks" className="text-xs rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-[hsl(var(--dna-emerald))]">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                         </svg>
                         Saved
                       </TabsTrigger>
                     </TooltipTrigger>
                     <TooltipContent>Bookmarked posts and stories</TooltipContent>
                   </Tooltip>
                 </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Tab Explainer */}
          <div className="mt-2">
            <FeedTabExplainer activeTab={activeTab} />
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
                  onClick={() => composer.open('post')}
                  className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"
                >
                  <PenSquare className="h-4 w-4 mr-2" />
                  Create Your First Post
                </Button>
              }
            />
          )}
        </main>

        {/* Right Sidebar - Trending, Suggestions, DIA */}
        <aside
          className="overflow-y-auto scrollbar-thin shrink-0"
          style={{ width: '300px' }}
        >
          <FeedRightSidebar />
        </aside>
      </div>

      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
        successData={composer.successData}
        onDismissSuccess={composer.dismissSuccess}
      />
      <SearchDialog
        isOpen={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
      />
    </div>
  );
};

export default DnaFeed;
