import { useState } from 'react';
import LayoutController from '@/components/LayoutController';
import { LeftNav } from '@/components/layout/columns/LeftNav';
import { RightWidgets } from '@/components/layout/columns/RightWidgets';
import { useConveyFeed } from '@/hooks/useConveyFeed';
import { ConveyFeedCard } from '@/components/convey/ConveyFeedCard';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Newspaper, Star, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TYPOGRAPHY } from '@/lib/typography.config';

export default function ConveyNewsroom() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('featured');

  // Fetch different feeds
  const { data: featuredData } = useConveyFeed({ page: 1, pageSize: 1 });
  const { data: industryData } = useConveyFeed({ page: 1, pageSize: 5 });
  const { data: latestData } = useConveyFeed({ page: 1, pageSize: 10 });
  const { data: myStoriesData } = useConveyFeed({ 
    onlyMySpaces: true, 
    page: 1, 
    pageSize: 10 
  });

  const centerColumn = (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className={`${TYPOGRAPHY.h1} mb-3`}>
          Your DNA Newsroom
        </h1>
        <p className={`${TYPOGRAPHY.bodyLarge} text-muted-foreground`}>
          Stay connected with curated stories, industry insights, and track your impact across the network.
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="featured" className="gap-2">
            <Star className="h-4 w-4" />
            Featured
          </TabsTrigger>
          <TabsTrigger value="industry" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Industry News
          </TabsTrigger>
          <TabsTrigger value="latest" className="gap-2">
            <Newspaper className="h-4 w-4" />
            Latest
          </TabsTrigger>
          <TabsTrigger value="mystories" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            My Stories
          </TabsTrigger>
        </TabsList>

        {/* Featured Story */}
        <TabsContent value="featured" className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-start gap-3 mb-4">
              <Star className="h-6 w-6 text-primary" />
              <div>
                <h2 className={`${TYPOGRAPHY.h2} mb-2`}>Featured Story</h2>
                <p className={TYPOGRAPHY.body}>Handpicked stories making waves in the DNA community</p>
              </div>
            </div>
            {featuredData?.data[0] ? (
              <ConveyFeedCard item={featuredData.data[0]} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No featured story available yet.
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Top Industry News */}
        <TabsContent value="industry" className="space-y-4">
          <div className="mb-4">
            <h2 className={`${TYPOGRAPHY.h2} mb-2 flex items-center gap-2`}>
              <TrendingUp className="h-6 w-6 text-primary" />
              Top Industry News
            </h2>
            <p className={TYPOGRAPHY.body}>Breaking stories and insights from across the diaspora</p>
          </div>
          {industryData?.data && industryData.data.length > 0 ? (
            <div className="space-y-4">
              {industryData.data.map((item) => (
                <ConveyFeedCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No industry news available yet.</p>
            </Card>
          )}
        </TabsContent>

        {/* Latest News */}
        <TabsContent value="latest" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" />
              Latest News
            </h2>
            <p className="text-muted-foreground">Fresh updates from the DNA community</p>
          </div>
          {latestData?.data && latestData.data.length > 0 ? (
            <div className="space-y-4">
              {latestData.data.map((item) => (
                <ConveyFeedCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No latest news available yet.</p>
            </Card>
          )}
        </TabsContent>

        {/* My Stories & Analytics */}
        <TabsContent value="mystories" className="space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              My Stories & Engagement
            </h2>
            <p className="text-muted-foreground">Track how your stories are performing across the network</p>
          </div>
          
          {/* Engagement Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Stories</div>
              <div className="text-3xl font-bold text-foreground">{myStoriesData?.data.length || 0}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Views</div>
              <div className="text-3xl font-bold text-primary">--</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Engagements</div>
              <div className="text-3xl font-bold text-accent">--</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Shares</div>
              <div className="text-3xl font-bold text-secondary">--</div>
            </Card>
          </div>

          {/* My Stories List */}
          {myStoriesData?.data && myStoriesData.data.length > 0 ? (
            <div className="space-y-4">
              {myStoriesData.data.map((item) => (
                <ConveyFeedCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                You haven't posted any stories yet. Start sharing your journey!
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <LayoutController
      leftColumn={<LeftNav />}
      centerColumn={centerColumn}
      rightColumn={<RightWidgets variant="convey" />}
    />
  );
}
