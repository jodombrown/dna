import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MobileViewContainer } from './MobileViewContainer';
import { useInfiniteFeedPosts } from '@/hooks/useInfiniteFeedPosts';
import { PostCard } from '@/components/posts/PostCard';
import { useAuth } from '@/contexts/AuthContext';
import { Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

/**
 * Mobile Feed View
 * Optimized feed experience for mobile with tabs and filters
 */
export const MobileFeedView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'connections' | 'my_posts'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteFeedPosts(activeTab, user?.id);

  const allPosts = data?.pages.flatMap(page => page.posts) || [];

  const handleTabChange = (value: string) => {
    if (value === 'all' || value === 'connections' || value === 'my_posts') {
      setActiveTab(value);
    }
  };

  const headerActions = (
    <Sheet open={showFilters} onOpenChange={setShowFilters}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2">
          <Filter className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Filter Feed</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Filter options coming soon...
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <MobileViewContainer
      title="Feed"
      showSearch
      headerActions={headerActions}
      noPadding
    >
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div className="sticky top-14 z-30 bg-background border-b border-border px-4">
          <TabsList className="w-full justify-start h-12 bg-transparent border-0 rounded-none">
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="connections" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              Network
            </TabsTrigger>
            <TabsTrigger 
              value="my_posts" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            >
              My Posts
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 pt-4">
          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    currentUserId={user?.id || ''}
                  />
                ))}
                {hasNextPage && (
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-3 text-sm text-muted-foreground"
                  >
                    {isFetchingNextPage ? 'Loading...' : 'Load more'}
                  </button>
                )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="connections" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : allPosts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No posts from your connections yet
              </p>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    currentUserId={user?.id || ''}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="my_posts" className="mt-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : allPosts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                You haven't created any posts yet
              </p>
            ) : (
              <div className="space-y-4">
                {allPosts.map((post) => (
                  <PostCard
                    key={post.post_id}
                    post={post}
                    currentUserId={user?.id || ''}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </MobileViewContainer>
  );
};
