import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Flag } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CommentSection } from './CommentSection';

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  post_type: string;
  visibility: string;
  is_pinned: boolean;
  is_flagged: boolean;
}

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  // Fetch author profile
  const { data: author } = useQuery({
    queryKey: ['user-profile', post.author_id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', post.author_id)
        .maybeSingle();
      return data;
    },
  });

  // Fetch like count and status
  const { data: likeCount } = useQuery({
    queryKey: ['post-likes-count', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('post_likes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
      return count || 0;
    },
  });

  const { data: hasLiked } = useQuery({
    queryKey: ['post-user-liked', post.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Fetch comment count
  const { data: commentCount } = useQuery({
    queryKey: ['post-comments-count', post.id],
    queryFn: async () => {
      const { count } = await supabase
        .from('post_comments')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id);
      return count || 0;
    },
  });

  // Fetch saved status
  const { data: isSaved } = useQuery({
    queryKey: ['post-saved', post.id, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  // Toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (hasLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-likes-count', post.id] });
      queryClient.invalidateQueries({ queryKey: ['post-user-liked', post.id] });
    },
  });

  // Toggle save
  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      if (isSaved) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('saved_posts')
          .insert({ post_id: post.id, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post-saved', post.id] });
      toast.success(isSaved ? 'Post unsaved' : 'Post saved');
    },
  });

  // Delete post
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      await supabase.from('posts').delete().eq('id', post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] });
      toast.success('Post deleted');
    },
  });

  const isOwnPost = user?.id === post.author_id;

  return (
    <Card className="p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={author?.avatar_url || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {author?.full_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{author?.full_name || 'User'}</p>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost && (
              <DropdownMenuItem onClick={() => deletePostMutation.mutate()}>
                Delete
              </DropdownMenuItem>
            )}
            {!isOwnPost && (
              <DropdownMenuItem>
                <Flag className="h-4 w-4 mr-2" />
                Report
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Post Content */}
      <div className="text-foreground whitespace-pre-wrap">{post.content}</div>

      {/* Post Actions */}
      <div className="flex items-center justify-between border-t pt-3">
        <div className="flex gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => user && toggleLikeMutation.mutate()}
            className={hasLiked ? 'text-red-500' : ''}
          >
            <Heart className={`h-4 w-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
            {likeCount || 0}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {commentCount || 0}
          </Button>

          <Button variant="ghost" size="sm" disabled>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => user && toggleSaveMutation.mutate()}
          className={isSaved ? 'text-primary' : ''}
        >
          <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && <CommentSection postId={post.id} />}
    </Card>
  );
}
