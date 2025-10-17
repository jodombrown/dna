import React, { useState } from 'react';
import { Megaphone, Share2, TrendingUp, Globe, Users, BarChart, Filter, Eye, Heart } from 'lucide-react';
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

  const features = [
    {
      icon: Megaphone,
      title: 'Amplify Impact',
      description: 'Share your success stories and innovations with the global diaspora'
    },
    {
      icon: Share2,
      title: 'Cross-Platform Reach',
      description: 'Distribute your message across multiple channels and communities'
    },
    {
      icon: TrendingUp,
      title: 'Track Engagement',
      description: 'Measure the reach and impact of your shared content'
    },
    {
      icon: Globe,
      title: 'Global Visibility',
      description: 'Connect with diaspora communities worldwide'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      
      {/* Hero Section */}
      <section className="pt-24 pb-8 px-4 bg-gradient-to-br from-dna-copper/5 via-background to-dna-gold/5">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-dna-copper text-white">
              Convey
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-dna-forest via-dna-emerald to-dna-copper bg-clip-text text-transparent">
              Share. Inspire. Transform.
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Amplify Africa's success stories, innovations, and impact across the global diaspora. 
              Your story can inspire thousands and catalyze change.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-copper mb-1">{stats.totalReach}</div>
                <div className="text-sm text-muted-foreground">Total Reach</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-emerald mb-1">{stats.storiesShared}</div>
                <div className="text-sm text-muted-foreground">Stories Shared</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-forest mb-1">{stats.totalEngagements}</div>
                <div className="text-sm text-muted-foreground">Engagements</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-dna-gold mb-1">{stats.activeContributors}</div>
                <div className="text-sm text-muted-foreground">Contributors</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <EnhancedCard key={index} hover className="border-dna-copper/20">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-dna-copper/10 rounded-lg mb-4">
                    <feature.icon className="h-6 w-6 text-dna-copper" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </EnhancedCard>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Energy">Energy</SelectItem>
                <SelectItem value="Education">Education</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <EnhancedButton 
            variant="dna" 
            onClick={() => setIsShareStoryDialogOpen(true)}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            Share Your Story
          </EnhancedButton>
        </div>

        {/* Impact Stories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Trending Impact Stories</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {impactStories.map((story) => (
              <EnhancedCard key={story.id} hover>
                {story.featured && (
                  <div className="bg-gradient-to-r from-dna-gold to-dna-copper text-white text-xs font-bold py-1 px-3 text-center">
                    FEATURED
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="bg-dna-forest text-white">
                      {story.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-1">{story.title}</CardTitle>
                  <CardDescription className="text-sm">
                    by {story.author}
                    {story.authorTitle && (
                      <span className="block text-xs mt-1">{story.authorTitle}</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-dna-copper">{story.reach}</div>
                        <div className="text-xs text-muted-foreground">People Reached</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-dna-emerald">{story.engagement}</div>
                        <div className="text-xs text-muted-foreground">Engagements</div>
                      </div>
                    </div>
                    <div className="p-3 bg-dna-emerald/10 rounded-lg">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-dna-forest mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-dna-forest">{story.impact}</p>
                      </div>
                    </div>
                    <EnhancedButton 
                      className="w-full" 
                      variant="outline"
                      onClick={() => handleViewStory(story)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Read Full Story
                    </EnhancedButton>
                  </div>
                </CardContent>
              </EnhancedCard>
            ))}
          </div>
        </div>

        {/* Community Impact Stats */}
        <Card className="mb-12 border-dna-copper/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Community Impact</CardTitle>
            <CardDescription>Stories shared across the diaspora network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-copper mb-2">{stats.totalReach}</div>
                <div className="text-sm text-muted-foreground">Combined Reach</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-emerald mb-2">{stats.storiesShared}</div>
                <div className="text-sm text-muted-foreground">Stories Published</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-dna-forest mb-2">{stats.totalEngagements}</div>
                <div className="text-sm text-muted-foreground">Total Engagement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Page-specific Survey CTA */}
        <div className="mt-12 bg-gradient-to-r from-dna-emerald/10 via-dna-copper/10 to-dna-gold/10 rounded-xl p-8 text-center border border-dna-copper/20">
          <h3 className="text-2xl font-bold text-dna-forest mb-4">
            Help Us Amplify Impact Stories
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Share your thoughts on how we can better showcase diaspora achievements and innovations. 
            Your feedback will help us build the most powerful storytelling platform for Africa's development.
          </p>
          <button
            onClick={() => setIsSurveyOpen(true)}
            className="bg-dna-copper hover:bg-dna-gold text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Share Your Convey Experience
          </button>
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
