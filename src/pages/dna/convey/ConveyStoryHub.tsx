import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BookOpen, Heart, Lightbulb, Users, PenSquare, Sparkles,
  Newspaper, Camera, Megaphone, Target, ChevronDown,
  Flame, Star, Filter
} from 'lucide-react';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { Badge } from '@/components/ui/badge';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { useMobile } from '@/hooks/useMobile';
import { STORY_TYPE_CONFIG, type StoryType } from '@/types/storyTypes';
import { cn } from '@/lib/utils';
import { useInfiniteUniversalFeed } from '@/hooks/useInfiniteUniversalFeed';
import { ConveyTrendingSection } from '@/components/convey/ConveyTrendingSection';
import { ConveyStoryCard } from '@/components/convey/ConveyStoryCard';
import { ConveyCategorySection, ConveyDiscussionPrompt, ConveyMiniCard } from '@/components/convey/ConveyCategorySection';
import { DiaContextual } from '@/components/dia';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type StoryTab = 'all' | 'my_stories' | 'saved';

// Category pills for navigation
const categoryPills = [
  { id: 'all' as const, label: 'All', icon: Sparkles },
  { id: 'impact' as StoryType, label: 'Impact', icon: Target },
  { id: 'update' as StoryType, label: 'Updates', icon: Megaphone },
  { id: 'spotlight' as StoryType, label: 'Spotlights', icon: Star },
  { id: 'photo_essay' as StoryType, label: 'Photos', icon: Camera },
];

// Tab options
const tabOptions = [
  { id: 'all' as StoryTab, label: 'All Stories', icon: Newspaper },
  { id: 'my_stories' as StoryTab, label: 'My Stories', icon: PenSquare },
  { id: 'saved' as StoryTab, label: 'Saved', icon: BookOpen },
];

export default function ConveyStoryHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoryTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<StoryType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const composer = useUniversalComposer();
  const { isMobile, isTablet } = useMobile();

  // Fetch stories
  const {
    feedItems: stories,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteUniversalFeed({
    viewerId: user?.id || '',
    tab: activeTab === 'my_stories' ? 'my_posts' : activeTab === 'saved' ? 'bookmarks' : 'all',
    authorId: activeTab === 'my_stories' ? user?.id : undefined,
    postType: 'story',
    rankingMode: 'latest',
  });

  // Filter stories by category (using string comparison for flexibility)
  const filteredStories = useMemo(() => {
    let result = stories;
    if (selectedCategory !== 'all') {
      result = result.filter(s => String(s.post_type) === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.content?.toLowerCase().includes(query) ||
        s.author_display_name?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [stories, selectedCategory, searchQuery]);

  // Get trending stories (top engaged)
  const trendingStories = useMemo(() => {
    return [...stories]
      .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, 4);
  }, [stories]);

  // Group by category for sections (using string comparison)
  const impactStories = stories.filter(s => String(s.post_type) === 'impact').slice(0, 3);
  const spotlightStories = stories.filter(s => String(s.post_type) === 'spotlight').slice(0, 4);
  const updateStories = stories.filter(s => String(s.post_type) === 'update').slice(0, 4);

  const currentTabOption = tabOptions.find(t => t.id === activeTab) || tabOptions[0];

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-background to-muted/20">
        <div className="p-4 rounded-2xl bg-dna-gold/10 mb-6">
          <BookOpen className="h-12 w-12 text-dna-gold" />
        </div>
        <h1 className="text-3xl font-bold mb-3">Stories from the Diaspora</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Discover inspiring narratives, share your journey, and connect through the power of storytelling.
        </p>
        <Button onClick={() => navigate('/auth')} size="lg" className="bg-dna-gold hover:bg-dna-gold/90">
          Sign In to Explore
        </Button>
      </div>
    );
  }

  // Desktop Left Sidebar
  const leftColumn = isMobile ? null : (
    <div className="space-y-6">
      {/* Quick Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4 text-dna-gold" />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "bg-dna-gold/10 text-dna-gold font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Your Stories Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-dna-gold" />
            Your Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {tabOptions.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2 p-2.5 rounded-lg text-sm transition-colors",
                  isActive
                    ? "bg-dna-gold/10 text-dna-gold font-medium"
                    : "text-muted-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Story Types Info */}
      <Card className="border-dna-gold/20 bg-gradient-to-br from-dna-gold/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-dna-gold" />
            Story Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.values(STORY_TYPE_CONFIG).slice(0, 4).map((config) => (
            <div key={config.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors">
              <span className="text-base">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // Main Center Content
  const centerColumn = (
    <div className="space-y-4">
      {/* Sticky Header */}
      <div className={cn(
        "bg-background/95 backdrop-blur-sm z-10",
        isMobile ? "sticky top-0 pt-2 pb-3 border-b border-border/50 -mx-4 px-4" : "pb-2"
      )}>
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-dna-gold to-amber-600 shadow-lg shrink-0",
              isMobile ? "p-2" : "p-2.5"
            )}>
              <BookOpen className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6")} />
            </div>
            <div>
              <h1 className={cn("font-bold tracking-tight", isMobile ? "text-xl" : "text-2xl")}>
                Convey
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Stories that inspire the movement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Tab Dropdown */}
            {(isMobile || isTablet) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 h-8 px-2">
                    <currentTabOption.icon className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border shadow-lg z-50">
                  {tabOptions.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "gap-2 cursor-pointer",
                          activeTab === tab.id && "bg-dna-gold/10 text-dna-gold"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              onClick={() => composer.open('story')}
              size="sm"
              className="bg-dna-gold hover:bg-dna-gold/90 text-white shadow-md h-8 px-3"
            >
              <PenSquare className="h-4 w-4" />
              {!isMobile && <span className="ml-2">Write</span>}
            </Button>
          </div>
        </div>

        {/* Category Pills - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categoryPills.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full whitespace-nowrap transition-all",
                  "text-xs font-medium border shrink-0 px-3 py-1.5",
                  isActive
                    ? "bg-dna-gold text-white border-dna-gold"
                    : "bg-background border-border hover:border-dna-gold/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-white" : "text-muted-foreground")} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Section - BuzzFeed Style (self-contained with hook) */}
      {activeTab === 'all' && selectedCategory === 'all' && (
        <ConveyTrendingSection />
      )}

      {/* Category Sections when viewing "All" */}
      {activeTab === 'all' && selectedCategory === 'all' && !isLoading && (
        <>
          {/* Impact Stories Section */}
          {impactStories.length > 0 && (
            <ConveyCategorySection
              title="Impact Stories"
              icon={<Target className="h-4 w-4" />}
              stories={impactStories}
              color="text-emerald-600"
              layout="featured"
              onSeeAll={() => setSelectedCategory('impact')}
            />
          )}

          {/* Updates Section */}
          {updateStories.length > 0 && (
            <ConveyCategorySection
              title="Latest Updates"
              icon={<Megaphone className="h-4 w-4" />}
              stories={updateStories}
              color="text-blue-600"
              layout="horizontal"
              onSeeAll={() => setSelectedCategory('update')}
            />
          )}

          {/* Spotlights Section */}
          {spotlightStories.length > 0 && (
            <ConveyCategorySection
              title="Community Spotlights"
              icon={<Star className="h-4 w-4" />}
              stories={spotlightStories}
              color="text-amber-600"
              layout="grid"
              onSeeAll={() => setSelectedCategory('spotlight')}
            />
          )}
        </>
      )}

      {/* Filtered Feed */}
      {(selectedCategory !== 'all' || activeTab !== 'all') && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === 'my_stories'
                  ? "Share your first story with the community"
                  : activeTab === 'saved'
                  ? "Bookmark stories you want to revisit"
                  : "Be the first to share in this category"}
              </p>
              {activeTab !== 'saved' && (
                <Button onClick={() => composer.open('story')} className="bg-dna-gold hover:bg-dna-gold/90">
                  <PenSquare className="h-4 w-4 mr-2" />
                  Write a Story
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredStories.map((story) => (
                <ConveyStoryCard key={story.post_id} story={story} />
              ))}
            </div>
          )}

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? 'Loading...' : 'Load More Stories'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Right Sidebar
  const rightColumn = isMobile ? null : (
    <div className="space-y-6">
      {/* DIA Contextual for CONVEY */}
      <DiaContextual
        pillar="convey"
        collapsed={false}
        compact
      />

      {/* Write CTA Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-24 bg-gradient-to-br from-dna-gold via-amber-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-white font-bold text-lg drop-shadow-md">Share Your Story</h3>
            <p className="text-white/80 text-xs">Inspire the diaspora with your journey</p>
          </div>
        </div>
        <CardContent className="pt-4">
          <Button
            onClick={() => composer.open('story')}
            className="w-full bg-dna-gold hover:bg-dna-gold/90"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Start Writing
          </Button>
        </CardContent>
      </Card>

      {/* Trending Mini List */}
      {trendingStories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Hot Right Now
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {trendingStories.slice(0, 3).map((story, i) => (
              <div key={story.post_id} className="flex items-start gap-2">
                <span className="text-lg font-bold text-muted-foreground/30">{i + 1}</span>
                <ConveyMiniCard story={story} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Why Stories Matter */}
      <Card className="border-dna-gold/20 bg-gradient-to-br from-dna-gold/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Heart className="h-4 w-4 text-dna-gold" />
            Why Stories Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Build credibility and attract opportunities</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Inspire others with your journey</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Create social proof for the movement</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background pb-16 md:pb-0">
        <LayoutController
          leftColumn={leftColumn}
          centerColumn={centerColumn}
          rightColumn={rightColumn}
        />
      </div>

      {/* Mobile: Floating DIA button */}
      {isMobile && (
        <DiaContextual
          pillar="convey"
          floatingButton
        />
      )}

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
    </>
  );
}
