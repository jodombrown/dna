import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
// Navigation handled by child components
import { PenSquare, Sparkles, Users, Newspaper, TrendingUp, Search } from 'lucide-react';
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
import { FeedQuickLinks } from '@/components/feed/FeedQuickLinks';
import { FeedRightSidebar } from '@/components/feed/FeedRightSidebar';
import { FeedTab, RankingMode } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useMobile } from '@/hooks/useMobile';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();

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
            <div className="px-3 pb-2 pt-1 overflow-x-auto border-b border-border">
              <MobileFeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>

          {/* Add top padding to account for fixed header height */}
          <main className="pb-16 px-3 pt-[9rem] space-y-2">
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
 
  // Desktop layout - LinkedIn-style 3-column
  return (
    <div className="min-h-screen bg-background">
      {/* First-time user walkthrough */}
      <FirstTimeWalkthrough />
      
      {/* LinkedIn-style 3-column grid */}
      <div 
        className="max-w-7xl mx-auto px-4 py-6 grid gap-6"
        style={{ 
          gridTemplateColumns: '240px minmax(0, 1fr) 300px',
          paddingTop: 'calc(var(--header-h, 96px) + 1.5rem)'
        }}
      >
        {/* Left Sidebar - Profile Card & Quick Links */}
        <aside className="space-y-4 sticky top-[calc(var(--header-h,96px)+1.5rem)] h-fit">
          <FeedProfileCard />
          <FeedQuickLinks />
        </aside>

        {/* Center Column - Main Feed */}
        <main className="min-w-0 space-y-3">
          <ProfileCompletionNudge variant="banner" threshold={40} />
          
          {/* Compact Feed Header */}
          <div className="flex items-center justify-between">
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
                  <span>Top</span>
                </TabsTrigger>
                <TabsTrigger value="latest" className="flex items-center gap-1.5 text-xs px-2">
                  <Sparkles className="h-3 w-3" />
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

          {/* Filter Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
            <TabsList className="w-full grid grid-cols-5 h-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="all" className="text-xs">
                    <Newspaper className="h-4 w-4 mr-1.5" />
                    All
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>All posts from across DNA</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="for_you" className="text-xs">
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    For You
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Personalized based on your interests</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="network" className="text-xs">
                    <Users className="h-4 w-4 mr-1.5" />
                    Network
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Posts from your connections</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="my_posts" className="text-xs">
                    <PenSquare className="h-4 w-4 mr-1.5" />
                    Mine
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent>Your posts and stories</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="bookmarks" className="text-xs">
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

          {/* Tab Explainer */}
          <FeedTabExplainer activeTab={activeTab} />

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

        {/* Right Sidebar - Suggestions & Trending */}
        <aside className="space-y-4 sticky top-[calc(var(--header-h,96px)+1.5rem)] h-fit">
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
