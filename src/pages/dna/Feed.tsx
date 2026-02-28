import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Sparkles, Users, Newspaper, TrendingUp, Search, Clock, Camera, Calendar, BookOpen } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { SearchDialog } from '@/components/feed/SearchDialog';
import { MobileFeedTabs } from '@/components/feed/MobileFeedTabs';
import { FeedTabExplainer } from '@/components/feed/FeedTabExplainer';
import { MobileProfileCompletionBanner } from '@/components/feed/MobileProfileCompletionBanner';
import { FirstTimeWalkthrough } from '@/components/onboarding/FirstTimeWalkthrough';
import { FeedHeroGreeting } from '@/components/feed/FeedHeroGreeting';
import { FeedCommunityPulse } from '@/components/feed/FeedCommunityPulse';
import { FeedStatsBar } from '@/components/feed/FeedStatsBar';
import { FeedEventsCarousel } from '@/components/feed/FeedEventsCarousel';
import { FeedSponsorCard } from '@/components/feed/FeedSponsorCard';
import { FeedActiveSpaces } from '@/components/feed/FeedActiveSpaces';
import { NewPostsIndicator } from '@/components/feed/NewPostsIndicator';
import { FeedTab, RankingMode } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useMobile } from '@/hooks/useMobile';
import { incrementSessionCount } from '@/services/dia-feed-cadence';
import { useLocation } from 'react-router-dom';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';
import { Bookmark, MapPin } from 'lucide-react';

const FEED_SCROLL_KEY = 'dna_feed_scroll_position';

const DnaFeed = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const urlParams = new URLSearchParams(location.search);
  const initialTab = (urlParams.get('tab') as FeedTab) || 'all';
  const [activeTab, setActiveTab] = useState<FeedTab>(initialTab);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') as FeedTab | null;
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [newPostCount, setNewPostCount] = useState(0);
  const [tabsVisible, setTabsVisible] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();

  useEffect(() => { incrementSessionCount(); }, []);

  // Scroll position preservation
  useEffect(() => {
    const savedScroll = sessionStorage.getItem(FEED_SCROLL_KEY);
    if (savedScroll) {
      const scrollY = parseInt(savedScroll, 10);
      requestAnimationFrame(() => window.scrollTo(0, scrollY));
      sessionStorage.removeItem(FEED_SCROLL_KEY);
    }
    const handleBeforeUnload = () => {
      sessionStorage.setItem(FEED_SCROLL_KEY, String(window.scrollY));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    return () => { sessionStorage.setItem(FEED_SCROLL_KEY, String(window.scrollY)); };
  }, []);

  // Auto-hide tabs while scrolling
  useEffect(() => {
    if (isMobile) return;
    const onScroll = () => {
      setTabsVisible(false);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => setTabsVisible(true), 3000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [isMobile]);

  const handleNewPostsClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setNewPostCount(0);
  }, []);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const displayName = profile.display_name || profile.username || 'Member';
  const initials = displayName.charAt(0).toUpperCase();
  const username = profile.username || '';

  // ─── Mobile layout (unchanged) ───
  if (isMobile) {
    return (
      <>
        <FirstTimeWalkthrough />
        <style>{`
          body:has([data-mobile-feed="true"]) header[data-unified-header] { display: none !important; }
          body:has([data-mobile-feed="true"]) > div > div { padding-top: 0 !important; }
        `}</style>
        <div className="min-h-screen bg-background" data-mobile-feed="true">
          <div className="fixed top-0 left-0 right-0 z-40 bg-background">
            <MobileHeader variant="feed" showSearch onSearchClick={() => setShowSearchDialog(true)} onComposerClick={() => composer.open('post')} className="border-b-0" />
            <MobileProfileCompletionBanner threshold={100} />
            <div className="px-3 pb-1.5 pt-0.5 overflow-x-auto border-b border-border">
              <MobileFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
          <NewPostsIndicator count={newPostCount} onClick={handleNewPostsClick} />
          <main className="pb-16 px-3 pt-[7.5rem] space-y-1">
            <FeedTabExplainer activeTab={activeTab} />
            {activeTab === 'for_you' ? (
              <PersonalizedFeed />
            ) : (
              <UniversalFeedInfinite
                viewerId={user.id} tab={activeTab} rankingMode={rankingMode}
                emptyMessage={activeTab === 'my_posts' ? "You haven't posted anything yet" : activeTab === 'network' ? "Your connections haven't posted yet" : 'No posts to show'}
                emptyAction={<Button onClick={() => composer.open('post')} className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"><PenSquare className="h-4 w-4 mr-2" />Create Your First Post</Button>}
              />
            )}
          </main>
          <MobileBottomNav />
          <UniversalComposer isOpen={composer.isOpen} mode={composer.mode} context={composer.context} isSubmitting={composer.isSubmitting} onClose={composer.close} onModeChange={composer.switchMode} onSubmit={composer.submit} successData={composer.successData} onDismissSuccess={composer.dismissSuccess} />
          <SearchDialog isOpen={showSearchDialog} onClose={() => setShowSearchDialog(false)} />
        </div>
      </>
    );
  }

  // ─── Desktop layout — 3-column "Informed Stream" ───
  return (
    <div className="min-h-screen bg-background" ref={feedContainerRef}>
      <FirstTimeWalkthrough />
      <NewPostsIndicator count={newPostCount} onClick={handleNewPostsClick} />

      <div className="max-w-7xl mx-auto px-4 pt-4 pb-12">
        {/* ── Compact Greeting Bar ── */}
        <FeedHeroGreeting onComposerOpen={(mode) => composer.open(mode as 'post' | 'event' | 'story')} />

        {/* ── 3-Column Layout ── */}
        <div className="flex gap-6 mt-4 items-start">

          {/* ── Left Rail ── */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-20 space-y-3">
            {/* Profile Card */}
            <div
              className="bg-card rounded-dna-xl border border-border/40 p-4 cursor-pointer group hover:shadow-dna-1 transition-all"
              onClick={() => navigate(`/dna/${username}`)}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-[hsl(var(--dna-emerald)/0.15)] group-hover:ring-[hsl(var(--dna-emerald)/0.3)] transition-all">
                  <AvatarImage src={profile.avatar_url || ''} alt={displayName} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{displayName}</p>
                  {profile.headline && <p className="text-xs text-muted-foreground truncate">{profile.headline}</p>}
                </div>
              </div>
              <p className="text-xs text-primary mt-3 font-medium group-hover:underline">View Profile →</p>
            </div>

            {/* Five C's Stats */}
            <FeedStatsBar />

            {/* Active Spaces */}
            <FeedActiveSpaces />

            {/* Profile Completion */}
            <ProfileCompletionNudge variant="banner" threshold={40} />
          </aside>

          {/* ── Center Feed ── */}
          <div className="flex-1 min-w-0 max-w-2xl space-y-3">
            {/* Composer Bar */}
            <div
              className="flex items-center gap-3 bg-card rounded-full px-3 py-2 shadow-dna-1 border border-border/40 cursor-pointer hover:shadow-dna-2 transition-all duration-200"
              onClick={() => composer.open('post')}
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm text-muted-foreground">What's on your mind?</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => { e.stopPropagation(); composer.open('post'); }} className="p-1.5 rounded-full hover:bg-muted transition-colors" title="Photo"><Camera className="h-4 w-4 text-dna-convey" /></button>
                <button onClick={(e) => { e.stopPropagation(); composer.open('event'); }} className="p-1.5 rounded-full hover:bg-muted transition-colors" title="Event"><Calendar className="h-4 w-4 text-dna-gold" /></button>
                <button onClick={(e) => { e.stopPropagation(); composer.open('story'); }} className="p-1.5 rounded-full hover:bg-muted transition-colors" title="Story"><BookOpen className="h-4 w-4 text-dna-copper" /></button>
              </div>
            </div>

            {/* Feed Header + Ranking Toggle */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setShowSearchDialog(true)} className="h-8 w-8 p-0">
                <Search className="h-4 w-4" />
              </Button>
              <Tabs value={rankingMode} onValueChange={(v) => setRankingMode(v as RankingMode)} className="w-auto">
                <TabsList className="h-8 bg-muted/30 rounded-full">
                  <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold">
                    <TrendingUp className="h-3 w-3" /><span>Top</span>
                  </TabsTrigger>
                  <TabsTrigger value="latest" className="flex items-center gap-1.5 text-xs px-3 rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold">
                    <Clock className="h-3 w-3" /><span>Latest</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Filter Tabs */}
            <div className="transition-all duration-500 ease-in-out overflow-hidden" style={{ maxHeight: tabsVisible ? '48px' : '0px', opacity: tabsVisible ? 1 : 0 }}>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
                <TabsList className="w-full grid grid-cols-5 h-10 bg-muted/20 rounded-full p-1">
                  <Tooltip><TooltipTrigger asChild><TabsTrigger value="all" className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold"><Newspaper className="h-3.5 w-3.5 mr-1.5" />All</TabsTrigger></TooltipTrigger><TooltipContent>All posts from across DNA</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><TabsTrigger value="for_you" className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold"><Sparkles className="h-3.5 w-3.5 mr-1.5" />For You</TabsTrigger></TooltipTrigger><TooltipContent>Personalized based on your interests</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><TabsTrigger value="network" className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold"><Users className="h-3.5 w-3.5 mr-1.5" />Network</TabsTrigger></TooltipTrigger><TooltipContent>Posts from your connections</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><TabsTrigger value="my_posts" className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold"><PenSquare className="h-3.5 w-3.5 mr-1.5" />Mine</TabsTrigger></TooltipTrigger><TooltipContent>Your posts and stories</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><TabsTrigger value="bookmarks" className="text-xs rounded-full data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-primary data-[state=active]:font-semibold"><Bookmark className="h-3.5 w-3.5 mr-1.5" />Saved</TabsTrigger></TooltipTrigger><TooltipContent>Bookmarked posts and stories</TooltipContent></Tooltip>
                </TabsList>
              </Tabs>
            </div>

            <FeedTabExplainer activeTab={activeTab} />

            {/* Feed Content */}
            {activeTab === 'for_you' ? (
              <PersonalizedFeed />
            ) : (
              <UniversalFeedInfinite
                viewerId={user.id} tab={activeTab} rankingMode={rankingMode}
                emptyMessage={activeTab === 'my_posts' ? "You haven't posted anything yet" : activeTab === 'network' ? "Your connections haven't posted yet" : 'No posts to show'}
                emptyAction={<Button onClick={() => composer.open('post')} className="bg-dna-emerald hover:bg-dna-emerald/90 text-white mt-4"><PenSquare className="h-4 w-4 mr-2" />Create Your First Post</Button>}
              />
            )}
          </div>

          {/* ── Right Rail ── */}
          <aside className="hidden lg:block w-80 shrink-0 sticky top-20 space-y-3">
            <FeedEventsCarousel />
            <FeedSponsorCard />
            <FeedCommunityPulse />
          </aside>
        </div>
      </div>

      <UniversalComposer isOpen={composer.isOpen} mode={composer.mode} context={composer.context} isSubmitting={composer.isSubmitting} onClose={composer.close} onModeChange={composer.switchMode} onSubmit={composer.submit} successData={composer.successData} onDismissSuccess={composer.dismissSuccess} />
      <SearchDialog isOpen={showSearchDialog} onClose={() => setShowSearchDialog(false)} />
    </div>
  );
};

export default DnaFeed;
