import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import PostComposer from './PostComposer';
import PostCard from './PostCard';
import FeedFilters from './FeedFilters';
import { usePosts } from '@/hooks/usePosts';

const FeedSection = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'connect' | 'collaborate' | 'contribute'>('all');
  const [activeRegion, setActiveRegion] = useState<string>('all');
  
  // Use the posts hook with filter
  const pillarFilter = activeFilter === 'all' ? undefined : activeFilter;
  const { posts, loading, refreshPosts } = usePosts(pillarFilter);

  return (
    <div className="lg:col-span-6 space-y-4">
      {/* Post Composer */}
      <PostComposer onPostCreated={refreshPosts} />

      {/* Feed Filters */}
      <FeedFilters 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        activeRegion={activeRegion}
        onRegionChange={setActiveRegion}
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
                {activeFilter === 'all' ? 'No posts yet' : `No ${activeFilter} posts yet`}
                {activeRegion !== 'all' && ` in ${activeRegion.replace('-', ' ')}`}
              </h3>
              <p className="text-sm">
                {activeFilter === 'all' 
                  ? 'Be the first to share something with the DNA community!' 
                  : `Be the first to post about ${activeFilter}!`
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedSection;