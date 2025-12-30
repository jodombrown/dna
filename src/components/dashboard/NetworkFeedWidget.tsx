import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NetworkFeedWidgetProps {
  currentUserId: string;
}

export function NetworkFeedWidget({ currentUserId }: NetworkFeedWidgetProps) {
  const navigate = useNavigate();

  const { data: posts, isLoading } = useQuery({
    queryKey: ['network-feed-widget', currentUserId],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('get_universal_feed', {
        p_viewer_id: currentUserId,
        p_tab: 'network',
        p_author_id: null,
        p_space_id: null,
        p_event_id: null,
        p_limit: 3,
        p_offset: 0,
        p_ranking_mode: 'latest',
      });

      if (error) {
        throw error;
      }

      // Map UniversalFeedItem to PostWithAuthor for widget compatibility
      return (data || []).map((item: any) => ({
        post_id: item.post_id,
        author_id: item.author_id,
        content: item.content,
        post_type: 'text',
        created_at: item.created_at,
        author_username: item.author_username,
        author_full_name: item.author_display_name,
        author_avatar_url: item.author_avatar_url,
        likes_count: item.like_count,
        comments_count: item.comment_count,
        image_url: item.media_url,
      })) as PostWithAuthor[];
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Network Updates
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dna/network')}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Loading...
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.post_id}
              className="flex gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              onClick={() => navigate('/dna/network')}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {post.author_full_name}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {post.content}
                </p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                  {post.likes_count > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {post.likes_count}
                    </span>
                  )}
                  {post.comments_count > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {post.comments_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            No updates from your network yet
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/dna/network')}
            className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/90"
          >
            Check Network Feed
          </Button>
        </div>
      )}
    </Card>
  );
}
