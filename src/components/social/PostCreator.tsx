
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Hash, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityRateLimit } from '@/hooks/useSecurityRateLimit';
import { validatePostSecurity } from '@/utils/securityMiddleware';
import { sanitizeInput } from '@/utils/securityEnhancements';

interface PostCreatorProps {
  onPostCreated?: (post: any) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Rate limiting for post creation (5 posts per 10 minutes)
  const { isLimited, timeRemaining, checkLimit, recordAttempt } = useSecurityRateLimit(
    'post_creation',
    { maxAttempts: 5, windowMs: 10 * 60 * 1000, penaltyMultiplier: 2 }
  );

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    // Check rate limiting
    if (checkLimit()) {
      toast({
        title: "Too Many Posts",
        description: `Please wait ${timeRemaining} seconds before posting again.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Security validation
      const securityValidation = await validatePostSecurity(
        { content: content.trim() },
        user.id
      );

      if (!securityValidation.isValid) {
        toast({
          title: "Content Validation Failed",
          description: securityValidation.errors[0] || "Please review your post content.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Record rate limit attempt
      recordAttempt();

      const hashtags = extractHashtags(content);
      const sanitizedContent = sanitizeInput(content.trim(), { maxLength: 5000 });
      
      // For now, we'll store posts in localStorage since there's no posts table
      // In production, this would go to Supabase
      const newPost = {
        id: Date.now().toString(),
        user_id: user.id,
        content: sanitizedContent,
        hashtags,
        created_at: new Date().toISOString(),
        reactions: {
          '👍': 0,
          '❤️': 0,
          '🔥': 0,
          '💡': 0,
          '🙌': 0
        },
        comments_count: 0
      };

      // Store in localStorage for now
      const existingPosts = JSON.parse(localStorage.getItem('dna_posts') || '[]');
      const updatedPosts = [newPost, ...existingPosts];
      localStorage.setItem('dna_posts', JSON.stringify(updatedPosts));

      setContent('');
      toast({
        title: "Post Created!",
        description: "Your post has been shared with the community.",
      });

      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Please sign in to create posts.</p>
        </CardContent>
      </Card>
    );
  }

  const hashtagCount = extractHashtags(content).length;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="Your profile" />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What would you like to share with your network?"
              rows={3}
              maxLength={500}
              className="resize-none border-0 shadow-none focus:ring-0 focus:border-0 p-0 text-lg placeholder:text-gray-400"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{content.length}/500</span>
                {hashtagCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {hashtagCount} hashtag{hashtagCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || loading || isLimited}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                {loading ? (
                  "Posting..."
                ) : isLimited ? (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Wait {timeRemaining}s
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
