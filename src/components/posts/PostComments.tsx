import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PostComment } from '@/types/posts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Send } from 'lucide-react';

interface PostCommentsProps {
  postId: string;
  currentUserId: string;
}

export function PostComments({ postId, currentUserId }: PostCommentsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: comments, refetch } = useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_post_comments', {
        p_post_id: postId,
        p_user_id: currentUserId,
      });

      if (error) throw error;
      return (data || []) as PostComment[];
    },
  });

  const handleSubmit = async () => {
    const trimmedComment = newComment.trim();

    if (!trimmedComment || trimmedComment.length === 0) {
      return;
    }

    if (trimmedComment.length > 500) {
      toast({
        title: 'Comment too long',
        description: 'Comments must be 500 characters or less',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: postId,
        user_id: currentUserId,
        content: trimmedComment,
      });

      if (error) throw error;

      setNewComment('');
      refetch();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Textarea
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value.slice(0, 500))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              Press Enter to post, Shift+Enter for new line
            </span>
            <span className="text-xs text-muted-foreground">
              {newComment.length}/500
            </span>
          </div>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !newComment.trim()}
          size="icon"
          className="bg-[hsl(151,75%,50%)] hover:bg-[hsl(151,75%,40%)] text-white h-10 w-10 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments?.map((comment) => (
          <div key={comment.comment_id} className="flex gap-3">
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
              <div className="bg-muted rounded-lg p-3">
                <h4
                  className="font-semibold text-sm cursor-pointer hover:text-[hsl(151,75%,50%)] transition-colors"
                  onClick={() => navigate(`/dna/${comment.author_username}`)}
                >
                  {comment.author_full_name}
                </h4>
                <p className="text-sm whitespace-pre-wrap break-words mt-1">
                  {comment.content}
                </p>
              </div>
              <span className="text-xs text-muted-foreground ml-3 mt-1 block">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}

        {comments && comments.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
