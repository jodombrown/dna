import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MobileViewContainer } from './MobileViewContainer';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { useAuth } from '@/contexts/AuthContext';
import { Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeedTab } from '@/types/feed';
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
  const [activeTab, setActiveTab] = useState<FeedTab>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as FeedTab);
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
          <TabsList className="w-full justify-start h-12 bg-transparent border-0 rounded-none overflow-x-auto">
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap"
            >
              Network
            </TabsTrigger>
            <TabsTrigger 
              value="my_posts" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap"
            >
              My Posts
            </TabsTrigger>
            <TabsTrigger 
              value="bookmarks" 
              className="flex-1 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none whitespace-nowrap"
            >
              Bookmarks
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="px-4 pt-4 pb-20">
          {/* All tabs use UniversalFeed now */}
          <UniversalFeed
            viewerId={user.id}
            tab={activeTab}
            emptyMessage={
              activeTab === 'bookmarks' 
                ? "You haven't bookmarked any posts yet"
                : activeTab === 'my_posts'
                ? "You haven't shared anything yet"
                : "No posts to show"
            }
          />
        </div>
      </Tabs>
    </MobileViewContainer>
  );
};
