import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import UnifiedHeader from '@/components/UnifiedHeader';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PenSquare, Newspaper, Users as UsersIcon, Sparkles } from 'lucide-react';

type FeedType = 'all' | 'connections' | 'my_posts';

export default function FeedPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ['feed-posts', user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: user.id,
        p_feed_type: activeTab,
        p_limit: 20,
        p_offset: 0,
      });

      if (error) throw error;
      return (data || []) as PostWithAuthor[];
    },
    enabled: !!user,
  });

  // Real-time subscription for new posts
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('feed_posts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_likes',
        },
        () => {
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_comments',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Feed</h1>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedType)} className="mb-6">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              <Newspaper className="h-4 w-4 mr-2" />
              All Posts
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex-1">
              <UsersIcon className="h-4 w-4 mr-2" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="my_posts" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              My Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Posts */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading posts...
            </div>
          ) : posts && posts.length === 0 ? (
            <div className="text-center py-12">
              <Newspaper className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeTab === 'my_posts'
                  ? "You haven't posted anything yet"
                  : 'No posts to show'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === 'my_posts'
                  ? 'Share your first update, article, question, or celebration'
                  : activeTab === 'connections'
                  ? 'Your connections haven\'t posted yet'
                  : 'Be the first to share something!'}
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
              >
                <PenSquare className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            </div>
          ) : (
            posts?.map((post) => (
              <div key={post.post_id}>
                <PostCard
                  post={post}
                  currentUserId={user?.id || ''}
                  onUpdate={refetch}
                  onCommentClick={() => handleCommentClick(post.post_id)}
                  showComments={expandedPostId === post.post_id}
                />
                {expandedPostId === post.post_id && (
                  <PostComments postId={post.post_id} currentUserId={user?.id || ''} />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <CreatePostDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        currentUserId={user?.id || ''}
        onSuccess={refetch}
      />
    </div>
  );
}
