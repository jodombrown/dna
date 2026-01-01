import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Sparkles, Users, Newspaper, TrendingUp, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileCompletionNudge } from '@/components/profile/ProfileCompletionNudge';
import LayoutController from '@/components/LayoutController';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { DashboardModules } from '@/components/feed/DashboardModules';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { PersonalizedFeed } from '@/components/feed/PersonalizedFeed';
import { SearchDialog } from '@/components/feed/SearchDialog';
import { MobileFeedTabs } from '@/components/feed/MobileFeedTabs';
import { FeedTabExplainer } from '@/components/feed/FeedTabExplainer';
import { MobileProfileCompletionBanner } from '@/components/feed/MobileProfileCompletionBanner';
import { FirstTimeWalkthrough } from '@/components/onboarding/FirstTimeWalkthrough';
import { FeedTab, RankingMode } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useMobile } from '@/hooks/useMobile';
import { useIsZeroStateUser } from '@/hooks/useZeroStateFeed';
import { DiscoveryFeed } from '@/components/zero-state';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const { preferences, isLoading: prefsLoading } = useDashboardPreferences();
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();
  const { isZeroState, isLoading: zeroStateLoading } = useIsZeroStateUser();


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

  // Left Column: Hidden for Feed Header Cleanup v1
  const leftColumn = null;

  // Center Column: Main Feed or Discovery Feed for new users
  const centerColumn = (
    <div className="space-y-2">
      {!isMobile && <ProfileCompletionNudge variant="banner" threshold={40} />}

      {/* Zero State Discovery Feed for new users */}
      {isZeroState && !zeroStateLoading && (
        <DiscoveryFeed />
      )}

      {/* Regular Feed for established users */}
      {!isZeroState && !zeroStateLoading && (
        <>
          {!isMobile && (
            <>
              {/* Compact Feed Header */}
              <div className="flex items-center justify-between py-1">
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
                    <TabsTrigger value="top" className="flex items-center gap-1.5 text-xs px-2">
                      <TrendingUp className="h-3 w-3" />
                      <span className="hidden sm:inline">Top</span>
                    </TabsTrigger>
                    <TabsTrigger value="latest" className="flex items-center gap-1.5 text-xs px-2">
                      <Sparkles className="h-3 w-3" />
                      <span className="hidden sm:inline">Latest</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Compact Create Post Card */}
              <Card
                className="p-2.5 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => composer.open('post')}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile.avatar_url || ''} />
                    <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-muted rounded-full px-3 py-1.5 text-sm text-muted-foreground">
                    What's on your mind?
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7">
                    <PenSquare className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            </>
          )}

          {/* Filter Tabs with Tooltips */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
            <TabsList className="w-full grid grid-cols-5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="all">
                    <Newspaper className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">All</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>All posts from across DNA</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="for_you">
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">For You</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Personalized based on your interests</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="network">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">My Network</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Posts from your connections</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="my_posts">
                    <PenSquare className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Mine</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Your posts and stories</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="bookmarks">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    <span className="hidden sm:inline">Saved</span>
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bookmarked posts and stories</p>
                </TooltipContent>
              </Tooltip>
            </TabsList>
          </Tabs>

          {/* Tab Explainer - shows once per day per tab */}
          <FeedTabExplainer activeTab={activeTab} />

          {/* Feed Content - Personalized or Universal */}
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
        </>
      )}
    </div>
  );

  // Right Column: Personalized Modules
  const rightColumn = prefsLoading ? (
    <div className="space-y-4">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
    </div>
  ) : (
    <DashboardModules
      visibleModules={preferences.visible_modules}
      collapsedModules={preferences.collapsed_modules}
      density={preferences.density}
    />
  );

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
            {/* Hide tabs for zero state users */}
            {!isZeroState && !zeroStateLoading && (
              <div className="px-3 pb-2 pt-1 overflow-x-auto border-b border-border">
                <MobileFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
              </div>
            )}
          </div>

          {/* Add top padding to account for fixed header height */}
          <main className={`pb-16 px-3 space-y-2 ${isZeroState ? 'pt-[6rem]' : 'pt-[9rem]'}`}>
            {/* Zero State Discovery Feed for new users */}
            {isZeroState && !zeroStateLoading && (
              <DiscoveryFeed />
            )}

            {/* Regular Feed for established users */}
            {!isZeroState && !zeroStateLoading && (
              <>
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
              </>
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
            onSubmit={composer.submit}
          />
          <SearchDialog
            isOpen={showSearchDialog}
            onClose={() => setShowSearchDialog(false)}
          />
        </div>
      </>
    );
  }
 
  // Desktop layout
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* First-time user walkthrough */}
      <FirstTimeWalkthrough />
      
      <LayoutController
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
      />
      <MobileBottomNav />
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
      />
      <SearchDialog
        isOpen={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
      />
    </div>
  );
};

export default DnaFeed;
