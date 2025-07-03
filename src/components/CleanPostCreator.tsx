
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImagePlus, Send } from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useCleanSocialPosts } from '@/hooks/useCleanSocialPosts';

const CleanPostCreator: React.FC = () => {
  const { user, profile } = useAuth();
  const { createPost } = useCleanSocialPosts();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="Share your thoughts with the DNA community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[80px] resize-none border-none shadow-none text-base placeholder:text-gray-500 focus-visible:ring-0"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ImagePlus className="w-4 h-4 mr-1" />
                  Photo
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {content.length > 0 && (
                  <span className="text-xs text-gray-500">
                    {content.length}/500
                  </span>
                )}
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || isSubmitting}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  {isSubmitting ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanPostCreator;
