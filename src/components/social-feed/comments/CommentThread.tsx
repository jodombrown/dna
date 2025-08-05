import React from 'react';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';
import { RequireProfileScore } from '@/components/profile/RequireProfileScore';
import { usePostComments } from './usePostComments';
import { Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentThreadProps {
  postId: string;
  initiallyExpanded?: boolean;
  className?: string;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  postId,
  initiallyExpanded = false,
  className = ""
}) => {
  const {
    comments,
    loading,
    addComment,
    deleteComment,
    refresh,
    error
  } = usePostComments({ postId, enabled: true });

  const handleAddComment = async (content: string) => {
    await addComment(content);
  };

  const handleReply = async (content: string, parentId: string) => {
    await addComment(content, parentId);
  };

  if (loading && comments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading comments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <span className="text-sm text-destructive">Failed to load comments</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh}
            className="text-destructive border-destructive/20"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comment Composer */}
      <RequireProfileScore min={50} featureName="commenting on posts">
        <CommentComposer
          onSubmit={handleAddComment}
          placeholder="Write a comment..."
          buttonText="Comment"
        />
      </RequireProfileScore>
      
      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span>
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </span>
          </div>
          
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onDelete={deleteComment}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <MessageCircle className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};