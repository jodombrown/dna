import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

interface CommentBoxProps {
  onSubmit: (content: string) => Promise<boolean>;
  placeholder?: string;
  isReply?: boolean;
  disabled?: boolean;
}

const CommentBox = ({ 
  onSubmit, 
  placeholder = "Write a comment...", 
  isReply = false,
  disabled = false 
}: CommentBoxProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const success = await onSubmit(content);
    if (success) {
      setContent('');
    }
    setSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-gray-500 bg-gray-50 rounded-lg">
        Please sign in to comment
      </div>
    );
  }

  return (
    <div className={`flex space-x-3 ${isReply ? 'ml-12 mt-3' : 'mt-4'}`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-dna-emerald text-white text-xs">
          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || submitting}
          className="min-h-[80px] resize-none text-sm"
        />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {isReply ? 'Cmd/Ctrl + Enter to reply' : 'Cmd/Ctrl + Enter to comment'}
          </span>
          
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting || disabled}
            size="sm"
            className="bg-dna-emerald hover:bg-dna-emerald/90"
          >
            {submitting ? 'Posting...' : (isReply ? 'Reply' : 'Comment')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommentBox;