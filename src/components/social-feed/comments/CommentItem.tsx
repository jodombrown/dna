import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Reply, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { CommentComposer } from './CommentComposer';
import type { Comment } from './usePostComments';

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  depth?: number;
  maxDepth?: number;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onDelete,
  depth = 0,
  maxDepth = 3
}) => {
  const [showReplyComposer, setShowReplyComposer] = useState(false);
  const { user } = useAuth();
  
  const isOwnComment = user?.id === comment.user_id;
  const canReply = depth < maxDepth;
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setShowReplyComposer(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      onDelete(comment.id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Comment */}
      <div className={`flex gap-3 ${depth > 0 ? 'ml-8' : ''}`}>
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage 
            src={comment.profiles.avatar_url} 
            alt={comment.profiles.full_name}
          />
          <AvatarFallback className="bg-dna-forest text-white text-xs">
            {getInitials(comment.profiles.full_name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-foreground">
                {comment.profiles.full_name}
              </span>
              {comment.profiles.professional_role && (
                <span className="text-xs text-muted-foreground">
                  • {comment.profiles.professional_role}
                </span>
              )}
              <time 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                dateTime={comment.created_at}
                title={new Date(comment.created_at).toLocaleString()}
              >
                {timeAgo}
              </time>
            </div>
            
            {isOwnComment && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">Comment options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Comment Content */}
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {comment.content}
          </div>
          
          {/* Comment Actions */}
          <div className="flex items-center gap-2">
            {canReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyComposer(!showReplyComposer)}
                className="h-6 text-xs text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
          </div>
          
          {/* Reply Composer */}
          {showReplyComposer && (
            <div className="mt-3">
              <CommentComposer
                onSubmit={handleReply}
                placeholder={`Reply to ${comment.profiles.full_name}...`}
                buttonText="Reply"
                autoFocus
                className="pl-0"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
};