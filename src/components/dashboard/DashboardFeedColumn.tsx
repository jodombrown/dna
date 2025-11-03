import { useState, useEffect } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { CreatePostDialog } from '@/components/posts/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PenSquare, Users, Sparkles } from 'lucide-react';
import { Profile } from '@/services/profilesService';

type FeedFilter = 'connections' | 'my_posts';

interface DashboardFeedColumnProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export default function DashboardFeedColumn({ profile, isOwnProfile }: DashboardFeedColumnProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<FeedFilter>('connections');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const { data: posts, refetch, isLoading, error } = useFeedPosts(activeTab, user?.id);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`network_feed_updates_${user.id}_${Date.now()}`) // Unique channel per mount
      .on(
        'postgres_changes',
        {
          event: '*',
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
          event: '*',
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
          event: '*',
          schema: 'public',
          table: 'post_comments',
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [user?.id, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Network</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stay connected with your network's latest updates
          </p>
        </div>
        {isOwnProfile && (
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as FeedFilter)} 
      >
        <TabsList className="w-full">
          <TabsTrigger value="connections" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Network Updates
          </TabsTrigger>
          <TabsTrigger value="my_posts" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            My Posts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
          <p className="font-semibold">Error loading posts</p>
          <p className="text-sm mt-1">{error.message}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()} 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            Loading posts...
          </div>
        ) : posts && posts.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {activeTab === 'my_posts'
                ? "You haven't posted anything yet"
                : 'No updates from your network'}
            </h3>
            <p className="text-muted-foreground">
              {activeTab === 'my_posts'
                ? 'Use the "Share" button above to create your first post'
                : "Your connections haven't posted yet. Check back soon!"}
            </p>
          </div>
        ) : (
          posts?.map((post) => (
            <div key={post.post_id}>
              <PostCard
                post={post}
                currentUserId={user?.id || ''}
                onUpdate={refetch}
                onCommentClick={() => handleCommentClick(post.post_id)}
              />
              {expandedPostId === post.post_id && (
                <PostComments postId={post.post_id} currentUserId={user?.id || ''} />
              )}
            </div>
          ))
        )}
      </div>

      {isOwnProfile && (
        <CreatePostDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          currentUserId={user?.id || ''}
          onSuccess={() => {
            refetch();
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}
