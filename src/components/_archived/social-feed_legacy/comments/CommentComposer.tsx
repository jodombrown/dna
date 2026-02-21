import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CommentComposerProps {
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
  buttonText?: string;
  autoFocus?: boolean;
  className?: string;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const CommentComposer: React.FC<CommentComposerProps> = ({
  onSubmit,
  placeholder = "Write a comment...",
  buttonText = "Comment",
  autoFocus = false,
  className = ""
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent(''); // Clear the form on success
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-4 text-sm text-muted-foreground bg-muted/50 rounded-lg">
        Please log in to leave a comment
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage 
            src={user.user_metadata?.avatar_url} 
            alt={user.user_metadata?.full_name || 'User'}
          />
          <AvatarFallback className="bg-dna-forest text-white text-xs">
            {getInitials(user.user_metadata?.full_name || user.email || 'U')}
          </AvatarFallback>
        </Avatar>
        
        <form onSubmit={handleSubmit} className="flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            className="min-h-[80px] resize-none text-sm"
            disabled={isSubmitting}
            autoFocus={autoFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              Press {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'} + Enter to post
            </p>
            
            <Button
              type="submit"
              size="sm"
              disabled={!content.trim() || isSubmitting}
              className="bg-dna-forest hover:bg-dna-forest/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {buttonText}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};