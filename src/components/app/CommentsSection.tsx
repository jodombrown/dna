import React from 'react';
import { MessageSquare } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import CommentBox from './CommentBox';
import CommentItem from './CommentItem';

type Comment = Tables<'comments'>;

interface CommentsSectionProps {
  postId: string;
  comments: Comment[];
  loading: boolean;
  onAddComment: (content: string, parentId?: string) => Promise<boolean>;
}

const CommentsSection = ({ 
  postId, 
  comments, 
  loading, 
  onAddComment 
}: CommentsSectionProps) => {
  // Organize comments into threads
  const topLevelComments = comments.filter(comment => !comment.parent_id);
  
  const getReplies = (parentId: string): Comment[] => {
    return comments.filter(comment => comment.parent_id === parentId);
  };

  const handleAddComment = async (content: string) => {
    return await onAddComment(content);
  };

  const handleAddReply = async (content: string, parentId: string) => {
    return await onAddComment(content, parentId);
  };

  if (loading) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-3">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 w-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex space-x-3">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {/* Comments Header */}
      <div className="flex items-center space-x-2 mb-3">
        <MessageSquare className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {comments.length === 0 
            ? 'No comments yet' 
            : `${comments.length} comment${comments.length === 1 ? '' : 's'}`
          }
        </span>
      </div>

      {/* Comment Input */}
      <CommentBox onSubmit={handleAddComment} />

      {/* Comments List */}
      {topLevelComments.length > 0 && (
        <div className="mt-4 space-y-1">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleAddReply}
              replies={getReplies(comment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;