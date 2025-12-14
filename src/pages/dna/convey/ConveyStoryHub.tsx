import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Heart, Lightbulb, TrendingUp, Users, PenSquare, Sparkles, Newspaper, Camera, Megaphone, Target } from 'lucide-react';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { Badge } from '@/components/ui/badge';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { useMobile } from '@/hooks/useMobile';
import { STORY_TYPE_CONFIG, type StoryType } from '@/types/storyTypes';
import { cn } from '@/lib/utils';

type StoryTab = 'all' | 'my_stories' | 'saved';

// Story type cards for Apple News-inspired filtering
const storyTypeCards = [
  { id: 'all' as const, label: 'All Stories', icon: Newspaper, color: 'text-foreground', bgColor: 'bg-muted/50' },
  { id: 'impact' as StoryType, label: 'Impact', icon: Target, color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  { id: 'update' as StoryType, label: 'Updates', icon: Megaphone, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  { id: 'spotlight' as StoryType, label: 'Spotlights', icon: Sparkles, color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  { id: 'photo_essay' as StoryType, label: 'Photo Essays', icon: Camera, color: 'text-purple-600', bgColor: 'bg-purple-500/10' },
];

export default function ConveyStoryHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoryTab>('all');
  const [selectedStoryType, setSelectedStoryType] = useState<StoryType | 'all'>('all');
  const composer = useUniversalComposer();
  const { isMobile } = useMobile();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <BookOpen className="h-16 w-16 text-dna-gold mb-4" />
        <h1 className="text-3xl font-bold mb-2">Stories from the Diaspora</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Sign in to share your story with the diaspora and discover longer narratives from our community.
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          Sign In
        </Button>
      </div>
    );
  }

  // Map our story tabs to feed tabs
  const feedTab = activeTab === 'my_stories' ? 'my_posts' : activeTab === 'saved' ? 'bookmarks' : 'all';

  const leftColumn = (
    <div className="space-y-6">
      {/* Story Type Categories - Apple News Style */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-dna-gold/10 to-transparent border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-dna-gold" />
            Browse Stories
          </CardTitle>
          <CardDescription className="text-xs">Filter by story type</CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {storyTypeCards.map((type) => {
            const Icon = type.icon;
            const isActive = selectedStoryType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedStoryType(type.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                  "hover:scale-[1.02] hover:shadow-sm",
                  isActive 
                    ? `${type.bgColor} ring-2 ring-dna-gold/30 shadow-sm` 
                    : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? type.bgColor : "bg-muted"
                )}>
                  <Icon className={cn("h-4 w-4", isActive ? type.color : "text-muted-foreground")} />
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}>
                  {type.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-dna-gold" />
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Your Stories */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-dna-gold" />
            Your Stories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StoryTab)} orientation="vertical" className="w-full">
            <TabsList className="flex flex-col h-auto w-full bg-transparent space-y-1">
              <TabsTrigger 
                value="all" 
                className="w-full justify-start data-[state=active]:bg-dna-gold/10 data-[state=active]:text-dna-gold"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                All Stories
              </TabsTrigger>
              <TabsTrigger 
                value="my_stories" 
                className="w-full justify-start data-[state=active]:bg-dna-gold/10 data-[state=active]:text-dna-gold"
              >
                <PenSquare className="h-4 w-4 mr-2" />
                My Stories
              </TabsTrigger>
              <TabsTrigger 
                value="saved" 
                className="w-full justify-start data-[state=active]:bg-dna-gold/10 data-[state=active]:text-dna-gold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Saved
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Story Themes (Future) */}
      <Card className="opacity-75">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
            Story Themes
          </CardTitle>
          <CardDescription className="text-xs">Browse by topic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-muted-foreground text-center py-2">
            Theme-based browsing coming soon
          </p>
          <Badge variant="secondary" className="w-full justify-center text-xs">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );

  const centerColumn = (
    <div className="space-y-6">
      {/* Header - Apple News Style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-dna-gold to-amber-600 shadow-lg shadow-dna-gold/20">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Convey</h1>
              <p className="text-muted-foreground text-sm">
                Stories from the Diaspora
              </p>
            </div>
          </div>
          <Button
            onClick={() => composer.open('story')}
            className="bg-dna-gold hover:bg-dna-gold/90 text-white shadow-lg shadow-dna-gold/20"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Tell a Story</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Mobile Story Type Filters - Horizontal Scroll */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {storyTypeCards.map((type) => {
            const Icon = type.icon;
            const isActive = selectedStoryType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedStoryType(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200",
                  "text-sm font-medium border",
                  isActive 
                    ? "bg-dna-gold text-white border-dna-gold shadow-md shadow-dna-gold/20" 
                    : "bg-background border-border hover:border-dna-gold/50 hover:bg-muted/50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-white" : type.color)} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Stream */}
      <UniversalFeedInfinite
        viewerId={user.id}
        tab={feedTab}
        authorId={activeTab === 'my_stories' ? user.id : undefined}
        postType="story"
        rankingMode="latest"
        emptyMessage={
          activeTab === 'my_stories'
            ? "You haven't shared any stories yet. Be the first to tell your narrative!"
            : activeTab === 'saved'
            ? "You haven't saved any stories yet. Bookmark stories you want to revisit."
            : "No stories yet. Be the first to share a longer narrative with the diaspora."
        }
        emptyAction={
          activeTab !== 'saved' && (
            <Button
              onClick={() => composer.open('story')}
              className="bg-dna-gold hover:bg-dna-gold/90 text-white mt-4"
            >
              <PenSquare className="h-4 w-4 mr-2" />
              Tell a Story
            </Button>
          )
        }
      />
    </div>
  );

  const rightColumn = (
    <div className="space-y-6 overflow-visible">
      {/* Featured Story Type Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-24 bg-gradient-to-br from-dna-gold via-amber-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-lg drop-shadow-md">Share Your Impact</h3>
            <p className="text-white/80 text-xs">Tell stories that inspire change</p>
          </div>
        </div>
        <CardContent className="pt-4">
          <Button
            onClick={() => composer.open('story')}
            variant="outline"
            className="w-full border-dna-gold text-dna-gold hover:bg-dna-gold hover:text-white"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Start Writing
          </Button>
        </CardContent>
      </Card>

      {/* Story Types Explained */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-dna-gold" />
            Story Types
          </CardTitle>
          <CardDescription className="text-xs">Choose your format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.values(STORY_TYPE_CONFIG).map((config) => (
            <div key={config.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-xl">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{config.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Why Stories Matter */}
      <Card className="border-dna-gold/20 bg-gradient-to-br from-dna-gold/5 to-transparent">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-dna-gold" />
            Why Stories Matter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Help others learn from your journey</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Connect dots across the diaspora</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Turn activity into narrative that inspires</span>
          </p>
        </CardContent>
      </Card>

      {/* Related Activity (Future) */}
      <Card className="opacity-75">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Related Activity
          </CardTitle>
          <CardDescription className="text-xs">
            Turn recent activity into stories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Recent events, spaces, and projects will appear here.
          </p>
          <Badge variant="secondary" className="w-full justify-center">Coming Soon</Badge>
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
