import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { PenSquare, Sparkles, Users, Newspaper, Settings, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStrengthBanner } from '@/components/shared/ProfileStrengthBanner';
import LayoutController from '@/components/LayoutController';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { DashboardModules } from '@/components/feed/DashboardModules';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { FeedTab, RankingMode } from '@/types/feed';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { MobileViewContainer } from '@/components/mobile/MobileViewContainer';
import { MobileHeader } from '@/components/mobile/MobileHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { useMobile } from '@/hooks/useMobile';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [rankingMode, setRankingMode] = useState<RankingMode>('latest');
  const { preferences, isLoading: prefsLoading } = useDashboardPreferences();
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();

  // Redirect to welcome wizard if no role set - MUST be before any returns
  useEffect(() => {
    if (!profileLoading && profile && !profile.user_role) {
      navigate('/dna/welcome', { replace: true });
    }
  }, [profileLoading, profile, navigate]);

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

  // Center Column: Main Feed
  const centerColumn = (
    <div className="space-y-2">
      {!isMobile && <ProfileStrengthBanner />}
      
      {!isMobile && (
        <>
          {/* Compact Feed Header */}
          <div className="flex items-center justify-between py-1">
            <h1 className="text-xl font-semibold">Feed</h1>
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

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedTab)}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">
            <Newspaper className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">All Posts</span>
            <span className="sm:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="network">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Network</span>
            <span className="sm:hidden">Network</span>
          </TabsTrigger>
          <TabsTrigger value="my_posts">
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">My Posts</span>
            <span className="sm:hidden">Mine</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="hidden sm:inline">Bookmarks</span>
            <span className="sm:hidden">Saved</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Universal Feed - Infinite Scroll */}
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

  // Mobile layout with custom header
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader 
          variant="feed"
          onComposerClick={() => composer.open('post')}
        />
        <main className="pb-16 pt-2 px-3">
          {centerColumn}
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
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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
    </div>
  );
};

export default DnaFeed;
