import React, { useState } from 'react';
import { Megaphone, Share2, TrendingUp, Globe, Users, BarChart, Filter, Eye, Heart, Calendar, Clock, ArrowRight, Newspaper } from 'lucide-react';
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';
import FeedbackPanel from '@/components/FeedbackPanel';
import PageSpecificSurvey from '@/components/survey/PageSpecificSurvey';
import { useConveyLogic } from '@/hooks/useConveyLogic';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { formatDistance } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ConveyExample = () => {
  useScrollToTop();
  const {
    impactStories,
    stats,
    isFeedbackPanelOpen,
    setIsFeedbackPanelOpen,
    isShareStoryDialogOpen,
    setIsShareStoryDialogOpen,
    isStoryDetailOpen,
    setIsStoryDetailOpen,
    selectedStory,
    handleViewStory,
    filterCategory,
    setFilterCategory
  } = useConveyLogic();

  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const featuredStory = impactStories.find(s => s.featured) || impactStories[0];
  const topStories = impactStories.filter(s => s.featured).slice(0, 3);
  const regularStories = impactStories.filter(s => !s.featured);

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      {/* Masthead */}
      <div className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Newspaper className="h-8 w-8 text-dna-copper" />
                <h1 className="text-4xl md:text-5xl font-bold font-serif">DiasporaDaily</h1>
              </div>
              <p className="text-sm text-muted-foreground italic">Stories of Impact • Innovation • Transformation</p>
            </div>
            <div className="text-right hidden md:block">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b bg-muted/30 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 overflow-x-auto py-3 px-4 sm:px-6 lg:px-8 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
            <Button 
              variant={filterCategory === 'all' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => setFilterCategory('all')}
              className="whitespace-nowrap flex-shrink-0 text-sm"
            >
              All Stories
            </Button>
            {['Energy', 'Education', 'Agriculture', 'Healthcare', 'Finance', 'Environment'].map(cat => (
              <Button 
                key={cat}
                variant={filterCategory === cat ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setFilterCategory(cat)}
                className="whitespace-nowrap flex-shrink-0 text-sm"
              >
                {cat}
              </Button>
            ))}
            {/* Spacer for scroll padding on right */}
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Featured Story - Hero */}
        {featuredStory && (
          <div className="mb-16">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1 space-y-4">
                <Badge className="bg-dna-copper text-white font-semibold">
                  FEATURED STORY
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold font-serif leading-tight">
                  {featuredStory.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{featuredStory.author}</span>
                  <span>•</span>
                  <span>{featuredStory.authorTitle}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistance(new Date(featuredStory.date), new Date(), { addSuffix: true })}
                  </div>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {featuredStory.content}
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <Badge variant="outline" className="text-xs">
                    {featuredStory.category}
                  </Badge>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{featuredStory.reach} readers</span>
                    <span>•</span>
                    <span>{featuredStory.engagement} interactions</span>
                  </div>
                </div>
                <EnhancedButton 
                  onClick={() => handleViewStory(featuredStory)}
                  size="lg"
                  className="mt-4"
                >
                  Read Full Story
                  <ArrowRight className="ml-2 h-4 w-4" />
                </EnhancedButton>
              </div>
              <div className="order-1 lg:order-2">
                <div className="aspect-[4/3] bg-gradient-to-br from-dna-copper/20 via-dna-emerald/20 to-dna-forest/20 rounded-lg flex items-center justify-center">
                  <div className="text-center p-8">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 text-dna-copper" />
                    <p className="text-lg font-semibold text-dna-forest">{featuredStory.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Stories Grid */}
        {topStories.length > 0 && (
          <div className="mb-16">
            <div className="border-b-2 border-foreground mb-8">
              <h3 className="text-2xl font-bold font-serif pb-2">Top Stories</h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {topStories.map((story) => (
                <article key={story.id} className="group cursor-pointer" onClick={() => handleViewStory(story)}>
                  <div className="aspect-[16/10] bg-gradient-to-br from-dna-copper/10 via-dna-emerald/10 to-dna-forest/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    <Badge className="text-xs bg-dna-forest text-white">{story.category}</Badge>
                  </div>
                  <Badge variant="outline" className="text-xs mb-2">
                    {story.category}
                  </Badge>
                  <h4 className="text-xl font-bold font-serif mb-2 group-hover:text-dna-copper transition-colors line-clamp-2">
                    {story.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <span className="font-medium">{story.author}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistance(new Date(story.date), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {story.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{story.reach} readers</span>
                    <span>•</span>
                    <span>{story.engagement} interactions</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Latest Stories - List View */}
        <div className="mb-16">
          <div className="border-b-2 border-foreground mb-8 flex items-center justify-between">
            <h3 className="text-2xl font-bold font-serif pb-2">Latest Stories</h3>
            <EnhancedButton 
              variant="ghost" 
              size="sm"
              onClick={() => setIsShareStoryDialogOpen(true)}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Submit Story
            </EnhancedButton>
          </div>
          <div className="space-y-8">
            {impactStories.map((story) => (
              <article 
                key={story.id} 
                className="group cursor-pointer border-b pb-8 last:border-0"
                onClick={() => handleViewStory(story)}
              >
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="md:col-span-1">
                    <div className="aspect-square bg-gradient-to-br from-dna-copper/10 via-dna-emerald/10 to-dna-forest/10 rounded-lg flex items-center justify-center">
                      <Badge className="bg-dna-forest text-white">{story.category}</Badge>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{story.category}</Badge>
                      {story.featured && (
                        <Badge className="text-xs bg-dna-gold text-white">Featured</Badge>
                      )}
                    </div>
                    <h4 className="text-2xl font-bold font-serif mb-2 group-hover:text-dna-copper transition-colors">
                      {story.title}
                    </h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                      <span className="font-medium text-foreground">{story.author}</span>
                      {story.authorTitle && (
                        <>
                          <span>•</span>
                          <span>{story.authorTitle}</span>
                        </>
                      )}
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistance(new Date(story.date), new Date(), { addSuffix: true })}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {story.reach}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {story.engagement}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:text-dna-copper">
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 p-3 bg-dna-emerald/5 rounded border-l-4 border-dna-emerald">
                      <p className="text-sm font-medium text-dna-forest">
                        <TrendingUp className="inline h-4 w-4 mr-1" />
                        Impact: {story.impact}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-foreground text-background rounded-lg p-8 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold font-serif mb-3">
              Stay Informed with DiasporaDaily
            </h3>
            <p className="text-background/80 mb-6">
              Get the latest stories of impact, innovation, and transformation delivered to your inbox.
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded bg-background text-foreground"
              />
              <EnhancedButton variant="secondary">
                Subscribe
              </EnhancedButton>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mb-12 bg-muted/50 rounded-lg p-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-dna-copper mb-2">{stats.totalReach}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Readers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-dna-emerald mb-2">{stats.storiesShared}</div>
            <div className="text-sm text-muted-foreground font-medium">Stories Published</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-dna-forest mb-2">{stats.totalEngagements}</div>
            <div className="text-sm text-muted-foreground font-medium">Total Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-dna-gold mb-2">{stats.activeContributors}</div>
            <div className="text-sm text-muted-foreground font-medium">Contributors</div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Story Detail Dialog */}
      <Dialog open={isStoryDetailOpen} onOpenChange={setIsStoryDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-dna-forest text-white">
                {selectedStory?.category}
              </Badge>
            </div>
            <DialogTitle className="text-2xl">{selectedStory?.title}</DialogTitle>
            <DialogDescription>
              by {selectedStory?.author}
              {selectedStory?.authorTitle && ` • ${selectedStory.authorTitle}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-copper">{selectedStory?.reach}</div>
                <div className="text-xs text-muted-foreground">Reached</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-dna-emerald">{selectedStory?.engagement}</div>
                <div className="text-xs text-muted-foreground">Engaged</div>
              </div>
              <div className="text-center">
                <Heart className="h-6 w-6 mx-auto text-dna-gold mb-1" />
                <div className="text-xs text-muted-foreground">Impact</div>
              </div>
            </div>
            <div className="p-4 bg-dna-emerald/10 rounded-lg">
              <p className="font-semibold text-dna-forest mb-2">Impact Achieved:</p>
              <p className="text-sm">{selectedStory?.impact}</p>
            </div>
            {selectedStory?.content && (
              <div className="prose prose-sm max-w-none">
                <p>{selectedStory.content}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <EnhancedButton className="flex-1" variant="default">
                <Share2 className="mr-2 h-4 w-4" />
                Share Story
              </EnhancedButton>
              <EnhancedButton className="flex-1" variant="outline">
                <Heart className="mr-2 h-4 w-4" />
                Save for Later
              </EnhancedButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Story Dialog */}
      <Dialog open={isShareStoryDialogOpen} onOpenChange={setIsShareStoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Impact Story</DialogTitle>
            <DialogDescription>
              Inspire the diaspora with your innovations and achievements
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Story submission feature coming soon!</p>
            <EnhancedButton variant="outline" onClick={() => setIsShareStoryDialogOpen(false)}>
              Close
            </EnhancedButton>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackPanel 
        isOpen={isFeedbackPanelOpen}
        onClose={() => setIsFeedbackPanelOpen(false)}
        pageType="convey"
      />
      
      <PageSpecificSurvey
        isOpen={isSurveyOpen}
        onClose={() => setIsSurveyOpen(false)}
        pageType="convey"
      />
    </div>
  );
};

export default ConveyExample;
