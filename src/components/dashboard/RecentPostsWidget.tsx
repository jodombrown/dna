import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PostWithAuthor } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentPostsWidgetProps {
  currentUserId: string;
}

export function RecentPostsWidget({ currentUserId }: RecentPostsWidgetProps) {
  const navigate = useNavigate();

  const { data: posts } = useQuery({
    queryKey: ['recent-posts-widget', currentUserId],
    queryFn: async () => {
      const { data, error } = await (supabase.rpc as any)('get_universal_feed', {
        p_viewer_id: currentUserId,
        p_tab: 'network',
        p_author_id: null,
        p_space_id: null,
        p_event_id: null,
        p_limit: 5,
        p_offset: 0,
        p_ranking_mode: 'latest',
      });

      if (error) throw error;
      
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
          <Newspaper className="h-5 w-5 text-dna-emerald" />
          Recent Activity
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dna/feed')}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {posts && posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.post_id}
              className="flex gap-3 p-3 hover:bg-accent rounded-lg cursor-pointer transition-colors"
              onClick={() => navigate('/dna/feed')}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">
                  {post.author_full_name}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-4 text-sm">
          No recent activity from your connections
        </p>
      )}
    </Card>
  );
}
