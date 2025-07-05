import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import CommentBox from './CommentBox';

type Comment = Tables<'comments'>;

interface CommentItemProps {
  comment: Comment;
  onReply: (content: string, parentId: string) => Promise<boolean>;
  replies?: Comment[];
  depth?: number;
}

const CommentItem = ({ comment, onReply, replies = [], depth = 0 }: CommentItemProps) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  
  // Mock author data - in real app this would come from a join with profiles/users table
  const author = {
    full_name: 'DNA Member',
    avatar_url: null
  };

  const timeAgo = formatDistanceToNow(new Date(comment.created_at!), { addSuffix: true });
  const isNested = depth > 0;
  const maxDepth = 3; // Limit nesting depth

  const handleReply = async (content: string) => {
    const success = await onReply(content, comment.id);
    if (success) {
      setShowReplyBox(false);
    }
    return success;
  };

  return (
    <div className={`${isNested ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={author.avatar_url || undefined} />
          <AvatarFallback className="bg-dna-emerald text-white text-xs">
            {author.full_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{author.full_name}</span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
          
          {depth < maxDepth && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="h-6 px-2 text-xs text-gray-600 hover:text-gray-800"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Reply
              </Button>
            </div>
          )}
          
          {showReplyBox && (
            <CommentBox
              onSubmit={handleReply}
              placeholder="Write a reply..."
              isReply={true}
            />
          )}
          
          {/* Render replies */}
          {replies.length > 0 && (
            <div className="mt-2">
              {replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  replies={[]} // Don't show nested replies of replies for now
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;