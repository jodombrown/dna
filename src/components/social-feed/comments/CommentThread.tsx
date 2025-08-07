import React from 'react';

interface CommentThreadProps {
  postId: string;
  onCommentAdded?: () => void;
}

// Placeholder component - comment functionality removed
const CommentThread: React.FC<CommentThreadProps> = ({ postId, onCommentAdded }) => {
  return null;
};

export default CommentThread;