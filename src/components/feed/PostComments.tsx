import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface PostCommentsProps {
  postId: string;
  initialCount?: number;
  onCommentCountChange?: (count: number) => void;
}

export const PostComments: React.FC<PostCommentsProps> = ({ 
  postId, 
  initialCount = 0,
  onCommentCountChange 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchComments = async () => {
    if (!showComments) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [showComments, postId]);

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on posts",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim(),
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      setComments(prev => [...prev, data]);
      setNewComment('');
      onCommentCountChange?.(comments.length + 1);

      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="border-t border-border">
      {/* Comments Toggle Button */}
      <div className="p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          {showComments ? 'Hide' : 'View'} Comments
          {initialCount > 0 && (
            <span className="text-xs bg-muted px-2 py-1 rounded-full">
              {comments.length || initialCount}
            </span>
          )}
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-3 pb-3 space-y-3">
          {/* Comments List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-dna-forest border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={comment.profiles.avatar_url} alt={comment.profiles.full_name} />
                    <AvatarFallback className="bg-dna-forest text-white text-xs">
                      {getInitials(comment.profiles.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm text-foreground">
                          {comment.profiles.full_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at))} ago
                        </span>
                      </div>
                      <p className="text-sm text-foreground break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm py-4">
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Comment Input */}
          {user && (
            <div className="flex gap-3 mt-4">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                <AvatarFallback className="bg-dna-forest text-white text-xs">
                  {getInitials(user.user_metadata?.full_name || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="resize-none min-h-[60px] text-sm"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Press Cmd/Ctrl + Enter to post
                  </span>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !newComment.trim()}
                    className="bg-dna-forest hover:bg-dna-forest/90"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                        Posting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-3 w-3" />
                        Post
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {!user && (
            <p className="text-center text-muted-foreground text-sm py-4">
              Please log in to comment on this post.
            </p>
          )}
        </div>
      )}
    </div>
  );
};