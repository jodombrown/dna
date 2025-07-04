
import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bookmark, FileText, Calendar, Briefcase, Trash2 } from 'lucide-react';
import { useSavedItems } from '@/hooks/useSavedItems';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import PostItem from '@/components/social/PostItem';
import EventCard from '@/components/social/EventCard';
import OpportunityCard from '@/components/social/OpportunityCard';
import SavedItemFilters from '@/components/saved/SavedItemFilters';
import SavedItemCard from '@/components/saved/SavedItemCard';
import { CleanSocialPost } from '@/hooks/useCleanSocialPosts';

const SavedPage = () => {
  const { toast } = useToast();
  const { savedItems, loading, unsaveItem } = useSavedItems();
  const [savedPosts, setSavedPosts] = useState<CleanSocialPost[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_saved');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const fetchSavedContent = async () => {
    if (savedItems.length === 0) return;

    setContentLoading(true);
    try {
      // Fetch saved posts
      const postIds = savedItems
        .filter(item => item.target_type === 'post')
        .map(item => item.target_id);

      if (postIds.length > 0) {
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!posts_user_id_fkey (
              full_name,
              display_name,
              avatar_url,
              profession
            )
          `)
          .in('id', postIds)
          .eq('is_published', true)
          .eq('moderation_status', 'approved');

        const formattedPosts: CleanSocialPost[] = postsData?.map(post => ({
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          post_type: post.post_type as CleanSocialPost['post_type'],
          media_urls: post.media_urls,
          image_url: post.image_url,
          hashtags: post.hashtags,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          created_at: post.created_at,
          author: post.profiles ? {
            full_name: post.profiles.full_name || 'Unknown User',
            display_name: post.profiles.display_name,
            avatar_url: post.profiles.avatar_url || undefined,
            profession: post.profiles.profession || undefined
          } : undefined
        })) || [];

        setSavedPosts(formattedPosts);
      }

      // Fetch saved events
      const eventIds = savedItems
        .filter(item => item.target_type === 'event')
        .map(item => item.target_id);

      if (eventIds.length > 0) {
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);

        setSavedEvents(eventsData || []);
      }

      // Fetch saved opportunities
      const opportunityIds = savedItems
        .filter(item => item.target_type === 'opportunity')
        .map(item => item.target_id);

      if (opportunityIds.length > 0) {
        try {
          const { data: opportunitiesData } = await (supabase as any)
            .from('opportunities')
            .select('*')
            .in('id', opportunityIds);

          setSavedOpportunities(opportunitiesData || []);
        } catch (error) {
          console.log('Opportunities table not ready yet:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching saved content:', error);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && savedItems.length > 0) {
      fetchSavedContent();
    }
  }, [savedItems, loading]);

  // Helper function to get item title - moved before useMemo
  const getItemTitle = (item: any) => {
    const post = savedPosts.find(p => p.id === item.target_id);
    const event = savedEvents.find(e => e.id === item.target_id);
    const opportunity = savedOpportunities.find(o => o.id === item.target_id);
    
    if (post) return post.content.substring(0, 60) + '...';
    if (event) return event.title;
    if (opportunity) return opportunity.title;
    return 'Saved Item';
  };

  // Filter and sort saved items
  const filteredItems = useMemo(() => {
    let filtered = [...savedItems];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(item => {
        const searchLower = searchQuery.toLowerCase();
        return (
          item.target_type.toLowerCase().includes(searchLower) ||
          (savedPosts.find(p => p.id === item.target_id)?.content?.toLowerCase().includes(searchLower)) ||
          (savedEvents.find(e => e.id === item.target_id)?.title?.toLowerCase().includes(searchLower)) ||
          (savedOpportunities.find(o => o.id === item.target_id)?.title?.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.created_at) >= filterDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_saved':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'date_created':
          // For posts, use their created_at, for others use item created_at
          const aDate = savedPosts.find(p => p.id === a.target_id)?.created_at || a.created_at;
          const bDate = savedPosts.find(p => p.id === b.target_id)?.created_at || b.created_at;
          return new Date(bDate).getTime() - new Date(aDate).getTime();
        case 'title':
          const aTitle = getItemTitle(a).toLowerCase();
          const bTitle = getItemTitle(b).toLowerCase();
          return aTitle.localeCompare(bTitle);
        case 'type':
          return a.target_type.localeCompare(b.target_type);
        default:
          return 0;
      }
    });

    return filtered;
  }, [savedItems, searchQuery, dateFilter, sortBy, savedPosts, savedEvents, savedOpportunities]);


  const enrichedItems = filteredItems.map(item => ({
    ...item,
    content: (() => {
      const post = savedPosts.find(p => p.id === item.target_id);
      const event = savedEvents.find(e => e.id === item.target_id);
      const opportunity = savedOpportunities.find(o => o.id === item.target_id);
      
      if (post) return { ...post, type: 'post' };
      if (event) return { ...event, type: 'event' };
      if (opportunity) return { ...opportunity, type: 'opportunity' };
      return null;
    })()
  }));

  // Get available tags from content
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    savedPosts.forEach(post => {
      post.hashtags?.forEach(tag => tags.add(tag));
    });
    savedEvents.forEach(event => {
      event.tags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  }, [savedPosts, savedEvents]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setDateFilter('all');
    setSortBy('date_saved');
    setSelectedTags([]);
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const item = savedItems.find(i => i.id === itemId);
      if (item) {
        await unsaveItem(item.target_type as any, item.target_id);
      }
      toast({
        title: "Item removed",
        description: "Item has been removed from your saved content",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };

  const handleViewItem = (item: any) => {
    // Navigate to appropriate page based on item type
    console.log('Viewing item:', item);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    try {
      // Remove selected items
      await Promise.all(selectedItems.map(async id => {
        const item = savedItems.find(i => i.id === id);
        if (item) {
          await unsaveItem(item.target_type as any, item.target_id);
        }
      }));
      setSelectedItems([]);
      toast({
        title: "Items removed",
        description: `${selectedItems.length} items have been removed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove items",
        variant: "destructive"
      });
    }
  };

  const postsCount = filteredItems.filter(item => item.target_type === 'post').length;
  const eventsCount = filteredItems.filter(item => item.target_type === 'event').length;
  const opportunitiesCount = filteredItems.filter(item => item.target_type === 'opportunity').length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Bookmark className="w-8 h-8 text-dna-emerald" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Saved Content</h1>
                  <p className="text-gray-600">
                    Your bookmarked posts, events, and opportunities ({filteredItems.length} items)
                  </p>
                </div>
              </div>
              
              {selectedItems.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  className="animate-fade-in"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedItems.length})
                </Button>
              )}
            </div>
          </div>

          <SavedItemFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
            onClearFilters={handleClearFilters}
          />

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                All ({filteredItems.length})
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Posts ({postsCount})
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events ({eventsCount})
              </TabsTrigger>
              <TabsTrigger value="opportunities" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Opportunities ({opportunitiesCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {loading || contentLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-600">Loading saved content...</div>
                </div>
              ) : filteredItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      {savedItems.length === 0 ? 'No saved content yet' : 'No items match your filters'}
                    </h3>
                    <p className="text-gray-500">
                      {savedItems.length === 0 
                        ? 'Start saving posts, events, and opportunities to see them here.'
                        : 'Try adjusting your search or filter criteria.'
                      }
                    </p>
                    {savedItems.length > 0 && (
                      <Button 
                        variant="outline" 
                        onClick={handleClearFilters}
                        className="mt-4"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className={viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                  : 'space-y-4'
                }>
                  {enrichedItems.map(item => (
                    <SavedItemCard
                      key={item.id}
                      item={item}
                      viewMode={viewMode}
                      onRemove={handleRemoveItem}
                      onView={handleViewItem}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
              }>
                {enrichedItems.filter(item => item.target_type === 'post').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
                      <p className="text-gray-500">Save posts to read them later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  enrichedItems
                    .filter(item => item.target_type === 'post')
                    .map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onRemove={handleRemoveItem}
                        onView={handleViewItem}
                      />
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
              }>
                {enrichedItems.filter(item => item.target_type === 'event').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved events</h3>
                      <p className="text-gray-500">Save events you're interested in attending.</p>
                    </CardContent>
                  </Card>
                ) : (
                  enrichedItems
                    .filter(item => item.target_type === 'event')
                    .map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onRemove={handleRemoveItem}
                        onView={handleViewItem}
                      />
                    ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-6">
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
              }>
                {enrichedItems.filter(item => item.target_type === 'opportunity').length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved opportunities</h3>
                      <p className="text-gray-500">Save opportunities you want to explore later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  enrichedItems
                    .filter(item => item.target_type === 'opportunity')
                    .map(item => (
                      <SavedItemCard
                        key={item.id}
                        item={item}
                        viewMode={viewMode}
                        onRemove={handleRemoveItem}
                        onView={handleViewItem}
                      />
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SavedPage;
