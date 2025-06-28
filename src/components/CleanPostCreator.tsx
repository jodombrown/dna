
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Hash } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';

const CleanPostCreator: React.FC = () => {
  const { user, profile } = useAuth();
  const { createPost } = useCleanSocialPosts();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    return text.match(hashtagRegex) || [];
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    setLoading(true);
    try {
      await createPost(content.trim(), 'text');
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
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
            <AvatarImage src={profile?.avatar_url} alt="Your profile" />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
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
                disabled={!content.trim() || loading}
                className="bg-dna-copper hover:bg-dna-gold text-white"
              >
                {loading ? (
                  "Posting..."
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

export default CleanPostCreator;
