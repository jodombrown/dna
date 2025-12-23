import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { mentionService } from '@/services/mentionService';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_username: string;
  author_full_name: string;
  author_avatar_url?: string;
  content: string;
  is_deleted: boolean;
  created_at: string;
}

interface GroupPostCommentsProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupPostComments({ postId, isOpen, onClose }: GroupPostCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  // Fetch comments
  const { data: comments, refetch } = useQuery({
    queryKey: ['group-post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_post_comments')
        .select(`
          id,
          post_id,
          author_id,
          content,
          is_deleted,
          created_at,
          profiles:author_id (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((comment: any) => ({
        id: comment.id,
        post_id: comment.post_id,
        author_id: comment.author_id,
        author_username: comment.profiles.username,
        author_full_name: comment.profiles.full_name,
        author_avatar_url: comment.profiles.avatar_url,
        content: comment.content,
        is_deleted: comment.is_deleted,
        created_at: comment.created_at,
      })) as Comment[];
    },
    enabled: isOpen,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('group_post_comments')
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, content) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });

      // Process mentions and send notifications (async, don't block UI)
      if (data && content) {
        const authorName = user?.user_metadata?.full_name || 'Someone';
        mentionService.processMentionsForComment(
          content,
          data.id,
          postId,
          user!.id,
          authorName
        ).catch(err => console.error('Failed to process group comment mentions:', err));
      }

      setNewComment('');
      toast({
        title: 'Comment added',
        description: 'Your comment has been posted',
      });
    },
    onError: (error) => {
      console.error('Comment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('group_post_comments')
        .update({ is_deleted: true })
        .eq('id', commentId)
        .eq('author_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['group-posts'] });
      toast({
        title: 'Comment deleted',
        description: 'Your comment has been removed',
      });
    },
  });

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  if (!isOpen) return null;

  return (
    <div className="mt-4 border-t pt-4 space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar
                className="h-8 w-8 cursor-pointer flex-shrink-0"
                onClick={() => navigate(`/dna/${comment.author_username}`)}
              >
                <AvatarImage src={comment.author_avatar_url} alt={comment.author_full_name} />
                <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
                  {getInitials(comment.author_full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <Card className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="font-semibold text-sm cursor-pointer hover:text-[hsl(151,75%,50%)] transition-colors"
                      onClick={() => navigate(`/dna/${comment.author_username}`)}
                    >
                      {comment.author_full_name}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                      {comment.author_id === user?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => deleteCommentMutation.mutate(comment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </Card>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Add Comment */}
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} alt="You" />
          <AvatarFallback className="bg-[hsl(151,75%,50%)] text-white text-xs">
            {user?.user_metadata?.full_name ? getInitials(user.user_metadata.full_name) : 'U'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 flex gap-2">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            maxLength={1000}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newComment.trim() || createCommentMutation.isPending}
            className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white"
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
