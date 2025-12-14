import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Heart, Lightbulb, TrendingUp, Users, PenSquare, Sparkles, Newspaper, Camera, Megaphone, Target, ChevronDown } from 'lucide-react';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { Badge } from '@/components/ui/badge';
import MobileBottomNav from '@/components/mobile/MobileBottomNav';
import { useMobile } from '@/hooks/useMobile';
import { STORY_TYPE_CONFIG, type StoryType } from '@/types/storyTypes';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type StoryTab = 'all' | 'my_stories' | 'saved';

// Story type filter options - compact for mobile horizontal scroll
const storyTypeFilters = [
  { id: 'all' as const, label: 'All', icon: Newspaper, color: 'text-foreground' },
  { id: 'impact' as StoryType, label: 'Impact', icon: Target, color: 'text-emerald-600' },
  { id: 'update' as StoryType, label: 'Updates', icon: Megaphone, color: 'text-blue-600' },
  { id: 'spotlight' as StoryType, label: 'Spotlights', icon: Sparkles, color: 'text-amber-600' },
  { id: 'photo_essay' as StoryType, label: 'Photos', icon: Camera, color: 'text-purple-600' },
];

// Tab options for dropdown
const tabOptions = [
  { id: 'all' as StoryTab, label: 'All Stories', icon: Sparkles },
  { id: 'my_stories' as StoryTab, label: 'My Stories', icon: PenSquare },
  { id: 'saved' as StoryTab, label: 'Saved', icon: BookOpen },
];

export default function ConveyStoryHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoryTab>('all');
  const [selectedStoryType, setSelectedStoryType] = useState<StoryType | 'all'>('all');
  const composer = useUniversalComposer();
  const { isMobile, isTablet } = useMobile();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="h-12 w-12 text-dna-gold mb-4" />
        <h1 className="text-2xl font-bold mb-2">Stories from the Diaspora</h1>
        <p className="text-muted-foreground mb-6 max-w-sm text-sm">
          Sign in to share your story and discover narratives from our community.
        </p>
        <Button onClick={() => navigate('/auth')} size="lg">
          Sign In
        </Button>
      </div>
    );
  }

  // Map our story tabs to feed tabs
  const feedTab = activeTab === 'my_stories' ? 'my_posts' : activeTab === 'saved' ? 'bookmarks' : 'all';
  const currentTabOption = tabOptions.find(t => t.id === activeTab) || tabOptions[0];

  const leftColumn = (
    <div className="space-y-6">
      {/* Story Type Categories - Desktop sidebar */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-dna-gold/10 to-transparent border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-dna-gold" />
            Browse Stories
          </CardTitle>
          <CardDescription className="text-xs">Filter by story type</CardDescription>
        </CardHeader>
        <CardContent className="p-3 space-y-2">
          {storyTypeFilters.map((type) => {
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
                    ? "bg-dna-gold/10 ring-2 ring-dna-gold/30 shadow-sm" 
                    : "hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-dna-gold/20" : "bg-muted"
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

      {/* Your Stories - Desktop */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
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
    <div className="space-y-4">
      {/* Sticky Mobile Header */}
      <div className={cn(
        "bg-background/95 backdrop-blur-sm z-10",
        isMobile && "sticky top-0 -mx-4 px-4 py-3 border-b border-border/50"
      )}>
        {/* Header Row: Title + Dropdown + CTA */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className={cn(
              "rounded-xl bg-gradient-to-br from-dna-gold to-amber-600 shadow-lg shadow-dna-gold/20 shrink-0",
              isMobile ? "p-2" : "p-2.5"
            )}>
              <BookOpen className={cn("text-white", isMobile ? "h-5 w-5" : "h-6 w-6")} />
            </div>
            <div className="min-w-0">
              <h1 className={cn("font-bold tracking-tight", isMobile ? "text-xl" : "text-2xl md:text-3xl")}>
                Convey
              </h1>
              {!isMobile && (
                <p className="text-muted-foreground text-sm truncate">
                  Stories from the Diaspora
                </p>
              )}
            </div>
          </div>

          {/* Mobile: Dropdown for tab selection */}
          {(isMobile || isTablet) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1.5 text-sm h-9 px-3 bg-background border-border shrink-0"
                >
                  <currentTabOption.icon className="h-4 w-4" />
                  <span className="hidden xs:inline">{currentTabOption.label}</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-44 bg-background border border-border shadow-lg z-50"
              >
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
            size={isMobile ? "sm" : "default"}
            className="bg-dna-gold hover:bg-dna-gold/90 text-white shadow-lg shadow-dna-gold/20 shrink-0"
          >
            <PenSquare className="h-4 w-4" />
            <span className={cn("ml-1.5", isMobile ? "hidden" : "hidden sm:inline")}>Tell a Story</span>
          </Button>
        </div>

        {/* Story Type Filters - Horizontal Scroll Pills (Mobile-optimized) */}
        <div className={cn(
          "flex gap-2 pb-1 scrollbar-hide",
          isMobile ? "overflow-x-auto -mx-4 px-4" : "overflow-x-auto"
        )}>
          {storyTypeFilters.map((type) => {
            const Icon = type.icon;
            const isActive = selectedStoryType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedStoryType(type.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full whitespace-nowrap transition-all duration-200",
                  "text-sm font-medium border shrink-0",
                  // Compact sizing for mobile
                  isMobile ? "px-3 py-1.5" : "px-4 py-2",
                  isActive 
                    ? "bg-dna-gold text-white border-dna-gold shadow-md shadow-dna-gold/20" 
                    : "bg-background border-border hover:border-dna-gold/50 hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  isMobile ? "h-3.5 w-3.5" : "h-4 w-4",
                  isActive ? "text-white" : type.color
                )} />
                <span className={isMobile ? "text-xs" : "text-sm"}>{type.label}</span>
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
    <div className="space-y-6">
      {/* Featured Story Type Card */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="h-20 bg-gradient-to-br from-dna-gold via-amber-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white font-bold text-base drop-shadow-md">Share Your Impact</h3>
            <p className="text-white/80 text-xs">Tell stories that inspire change</p>
          </div>
        </div>
        <CardContent className="pt-4">
          <Button
            onClick={() => composer.open('story')}
            variant="outline"
            size="sm"
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
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-dna-gold" />
            Story Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.values(STORY_TYPE_CONFIG).map((config) => (
            <div key={config.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-lg">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{config.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{config.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
            <span>Help others learn from your journey</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Connect dots across the diaspora</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-dna-gold mt-0.5">•</span>
            <span>Turn activity into inspiring narrative</span>
          </p>
        </CardContent>
      </Card>

      {/* Related Activity (Future) */}
      <Card className="opacity-75">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Related Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground text-center py-3">
            Recent events, spaces, and projects will appear here.
          </p>
          <Badge variant="secondary" className="w-full justify-center text-xs">Coming Soon</Badge>
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
