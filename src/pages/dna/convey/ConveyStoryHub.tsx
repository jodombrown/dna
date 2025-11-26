import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Heart, Lightbulb, TrendingUp, Users, PenSquare, Sparkles } from 'lucide-react';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { Badge } from '@/components/ui/badge';

type StoryTab = 'all' | 'my_stories' | 'saved';

export default function ConveyStoryHub() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StoryTab>('all');
  const composer = useUniversalComposer();

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
      {/* Story Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-dna-gold" />
            Story Filters
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
                <Users className="h-4 w-4 mr-2" />
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

      {/* Story Themes (MVP Stubs) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-dna-gold" />
            Story Themes
          </CardTitle>
          <CardDescription className="text-xs">Browse by topic</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal" 
            disabled
          >
            <span>Entrepreneurship & Ventures</span>
            <Badge variant="secondary" className="text-xs">Soon</Badge>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal" 
            disabled
          >
            <span>Communities & Ecosystems</span>
            <Badge variant="secondary" className="text-xs">Soon</Badge>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal" 
            disabled
          >
            <span>Learning & Leadership</span>
            <Badge variant="secondary" className="text-xs">Soon</Badge>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-between text-sm font-normal" 
            disabled
          >
            <span>Impact & Giving Back</span>
            <Badge variant="secondary" className="text-xs">Soon</Badge>
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const centerColumn = (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-dna-gold" />
          <h1 className="text-3xl font-bold">Stories from the Diaspora</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Longer narratives of how we're building, learning, and giving back.
        </p>
      </div>

      {/* Story Stream - Stories Only */}
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

      {/* Start a Story CTA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PenSquare className="h-4 w-4 text-dna-gold" />
            Start a Story
          </CardTitle>
          <CardDescription className="text-xs">
            Share what you're building, learning, or creating
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => composer.open('story')}
            className="w-full bg-dna-gold hover:bg-dna-gold/90 text-white"
          >
            Tell a Story
          </Button>
        </CardContent>
      </Card>

      {/* Related Activity (MVP Stub) */}
      <Card>
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
            Recent events, spaces, and projects you've interacted with will appear here.
          </p>
          <Badge variant="secondary" className="w-full justify-center">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <LayoutController
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
      />
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
