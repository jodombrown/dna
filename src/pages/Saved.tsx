
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, FileText, Calendar, Briefcase } from 'lucide-react';
import { useSavedItems } from '@/hooks/useSavedItems';
import { supabase } from '@/integrations/supabase/client';
import PostItem from '@/components/social/PostItem';
import EventCard from '@/components/social/EventCard';
import OpportunityCard from '@/components/social/OpportunityCard';
import { CleanSocialPost } from '@/hooks/useCleanSocialPosts';

const SavedPage = () => {
  const { savedItems, loading } = useSavedItems();
  const [savedPosts, setSavedPosts] = useState<CleanSocialPost[]>([]);
  const [savedEvents, setSavedEvents] = useState<any[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

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

  const postsCount = savedItems.filter(item => item.target_type === 'post').length;
  const eventsCount = savedItems.filter(item => item.target_type === 'event').length;
  const opportunitiesCount = savedItems.filter(item => item.target_type === 'opportunity').length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bookmark className="w-8 h-8 text-dna-emerald" />
              <h1 className="text-3xl font-bold text-gray-900">Saved Content</h1>
            </div>
            <p className="text-gray-600">
              Your bookmarked posts, events, and opportunities
            </p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                All ({savedItems.length})
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
                <div className="text-center py-8">Loading saved content...</div>
              ) : savedItems.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No saved content yet</h3>
                    <p className="text-gray-500">
                      Start saving posts, events, and opportunities to see them here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {savedPosts.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Posts</h3>
                      <div className="space-y-4">
                        {savedPosts.map(post => (
                          <PostItem key={post.id} post={post} />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {savedEvents.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Events</h3>
                      <div className="space-y-4">
                        {savedEvents.map(event => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    </div>
                  )}

                  {savedOpportunities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Opportunities</h3>
                      <div className="space-y-4">
                        {savedOpportunities.map(opportunity => (
                          <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="posts" className="mt-6">
              <div className="space-y-4">
                {savedPosts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved posts</h3>
                      <p className="text-gray-500">Save posts to read them later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedPosts.map(post => (
                    <PostItem key={post.id} post={post} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="space-y-4">
                {savedEvents.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved events</h3>
                      <p className="text-gray-500">Save events you're interested in attending.</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedEvents.map(event => (
                    <EventCard key={event.id} event={event} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="opportunities" className="mt-6">
              <div className="space-y-4">
                {savedOpportunities.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold mb-2">No saved opportunities</h3>
                      <p className="text-gray-500">Save opportunities you want to explore later.</p>
                    </CardContent>
                  </Card>
                ) : (
                  savedOpportunities.map(opportunity => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
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
