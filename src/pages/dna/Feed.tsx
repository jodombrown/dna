import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PenSquare, Sparkles, Users, Newspaper, Settings } from 'lucide-react';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { PostCard } from '@/components/posts/PostCard';
import { PostComments } from '@/components/posts/PostComments';
import { SkeletonPostCard } from '@/components/social-feed/SkeletonPostCard';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProfileStrengthBanner } from '@/components/shared/ProfileStrengthBanner';
import LayoutController from '@/components/LayoutController';
import UnifiedHeader from '@/components/UnifiedHeader';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { DashboardModules } from '@/components/feed/DashboardModules';

type FeedType = 'all' | 'connections' | 'my_posts';

const DnaFeed = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedType>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { preferences, isLoading: prefsLoading } = useDashboardPreferences();

  const { data: posts, refetch, isLoading } = useQuery({
    queryKey: ['feed-posts', user?.id, activeTab],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_user_id: user.id,
        p_feed_type: activeTab,
        p_hashtag: null,
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
      .channel(`feed_posts_${user.id}_${Date.now()}`) // Unique channel per mount
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_likes' }, () => {
        refetch();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'post_comments' }, () => {
        refetch();
      });

    try {
      // Guard against duplicate subscribe in StrictMode
      const anyChannel: any = channel as any;
      if (anyChannel.state !== 'joined' && anyChannel.state !== 'joining') {
        channel.subscribe();
      }
    } catch (err: any) {
      if (!String(err?.message || '').includes("subscribe' can only be called a single time")) {
        console.error('Realtime subscribe failed', err);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const handleCommentClick = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to welcome wizard if no role set
  if (!profileLoading && profile && !profile.user_role) {
    navigate('/dna/welcome', { replace: true });
    return null;
  }

  if (!user || !profile) {
    return null;
  }

  // Left Column: Navigation placeholder
  const leftColumn = (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-2">Quick Nav</h3>
        <div className="space-y-2 text-sm">
          <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/dna/connect')}>
            <Users className="w-4 h-4 mr-2" />
            Network
          </Button>
        </div>
      </Card>
    </div>
  );

  // Center Column: Main Feed
  const centerColumn = (
    <div className="space-y-4">
      <ProfileStrengthBanner />
      
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Your DNA Feed
          </h1>
          <p className="text-muted-foreground text-sm">Activity from across the network</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/dna/settings/dashboard')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* Create Post Card */}
      <Card 
        className="p-4 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setShowCreateDialog(true)}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url || ''} />
            <AvatarFallback>{profile.display_name?.[0] || profile.username?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground">
            What's on your mind?
          </div>
          <Button size="icon" variant="ghost">
            <PenSquare className="w-5 h-5" />
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as FeedType)}>
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">
            <Newspaper className="h-4 w-4 mr-2" />
            All Posts
          </TabsTrigger>
          <TabsTrigger value="connections" className="flex-1">
            <Users className="h-4 w-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="my_posts" className="flex-1">
            <Sparkles className="h-4 w-4 mr-2" />
            My Posts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Feed Content */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonPostCard key={i} />
          ))}
        </div>
      ) : posts && posts.length === 0 ? (
        <Card className="p-12 text-center">
          <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">
            {activeTab === 'my_posts'
              ? "You haven't posted anything yet"
              : 'No posts to show'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'my_posts'
              ? 'Share your first update, article, question, or celebration'
              : activeTab === 'connections'
              ? "Your connections haven't posted yet"
              : 'Be the first to share something!'}
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-dna-emerald hover:bg-dna-emerald/90 text-white"
          >
            <PenSquare className="h-4 w-4 mr-2" />
            Create Your First Post
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
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
          ))}
        </div>
      )}

      <EnhancedCreatePostDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        currentUserId={user?.id || ''}
        onSuccess={refetch}
      />
    </div>
  );

  // Right Column: Personalized Modules
  const rightColumn = prefsLoading ? (
    <div className="space-y-4">
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
    </div>
  ) : (
    <DashboardModules
      visibleModules={preferences.visible_modules}
      collapsedModules={preferences.collapsed_modules}
      density={preferences.density}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <LayoutController
        leftColumn={leftColumn}
        centerColumn={centerColumn}
        rightColumn={rightColumn}
      />
    </div>
  );
};

export default DnaFeed;
