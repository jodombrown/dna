import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Brain, Zap } from 'lucide-react';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import FeedFilters from './FeedFilters';
import { useRealTimeFeed } from '@/hooks/useRealTimeFeed';
import { useImpactTracking } from '@/hooks/useImpactTracking';
import AdinFeedIndicator from './AdinFeedIndicator';
import { Badge } from '@/components/ui/badge';
import { useLayoutStore } from '@/stores/layoutStore';

const FeedSection = () => {
  const [activeRegion, setActiveRegion] = useState<string>('all');
  const [adinEnabled, setAdinEnabled] = useState(true);
  const [advancedFilters, setAdvancedFilters] = useState<any>({});
  const { trackImpact } = useImpactTracking();
  const { activePillar } = useLayoutStore();
  
  // Use the new real-time feed hook
  const { posts, loading, addPost, refetch } = useRealTimeFeed();

  const handlePostCreated = async (postId: string, pillar: string) => {
    // Track impact if available
    await trackImpact('post', postId, pillar as any, 'post');
    // Refresh posts to show the new post immediately
    refetch();
  };

  // Filter posts based on active pillar
  const filteredPosts = activePillar === 'all' 
    ? posts 
    : posts.filter(post => post.pillar === activePillar);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Post Composer - Hidden on mobile */}
      <div className="hidden md:block">
        <PostComposer onPostCreated={handlePostCreated} />
      </div>

      {/* ADIN Status & Feed Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gradient-to-r from-dna-emerald/5 to-dna-copper/5 rounded-lg border">
        <div className="flex items-center gap-2">
          <AdinFeedIndicator isActive={adinEnabled} />
          <span className="text-xs text-gray-600">
            Intelligent feed powered by African Diaspora Intelligence Network
          </span>
        </div>
        <Badge 
          variant="outline" 
          className="cursor-pointer text-xs hover-scale"
          onClick={() => setAdinEnabled(!adinEnabled)}
        >
          {adinEnabled ? <Brain className="h-3 w-3 mr-1" /> : <Zap className="h-3 w-3 mr-1" />}
          {adinEnabled ? 'Smart Feed' : 'Chronological'}
        </Badge>
      </div>

      <FeedFilters 
        activeFilter={activePillar} 
        onFilterChange={() => {}} // Controlled by bottom nav now
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
        onAdvancedFiltersChange={setAdvancedFilters}
      />

      {/* Posts Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="flex space-x-3">
                    <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-8">
            <div className="text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                {activePillar === 'all' ? 'No posts yet' : `No ${activePillar} posts yet`}
                {activeRegion !== 'all' && ` in ${activeRegion.replace('-', ' ')}`}
              </h3>
              <p className="text-sm">
                {activePillar === 'all' 
                  ? 'Be the first to share something with the DNA community!' 
                  : `Be the first to post about ${activePillar}!`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredPosts.map((post, index) => (
            <div key={post.id} className="relative">
              {adinEnabled && post.adin_score && post.adin_score > 0.7 && index < 3 && (
                <div className="absolute -top-1 -left-1 z-10">
                  <Badge variant="secondary" className="text-xs bg-dna-emerald text-white animate-pulse">
                    <Brain className="h-3 w-3 mr-1" />
                    Highly Relevant
                  </Badge>
                </div>
              )}
              <PostCard 
                key={post.id} 
                post={post as any}
              />
              {adinEnabled && post.adin_score && (
                <div className="text-xs text-gray-400 px-4 pb-2">
                  <AdinFeedIndicator 
                    isActive={true} 
                    score={post.adin_score} 
                    signals={post.adin_signals}
                    className="justify-end"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedSection;