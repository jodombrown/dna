
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Image, Globe } from 'lucide-react';

interface PostCreatorProps {
  onPostCreated: () => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!user || !content.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: 'text'
        });

      if (error) throw error;

      setContent('');
      onPostCreated();
      toast({
        title: "Post created",
        description: "Your post has been shared with the DNA community"
      });
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) {
    return (
      <Card className="border">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Please sign in to share your thoughts with the DNA community.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src="/placeholder.svg" alt="Your profile" />
            <AvatarFallback className="bg-dna-copper text-white">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share your insights, achievements, or ask the community for support..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 p-0 text-base focus-visible:ring-0"
              maxLength={500}
            />
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>Public post</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" disabled>
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button 
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                  onClick={handleCreatePost}
                  disabled={!content.trim() || isPosting}
                >
                  {isPosting ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCreator;
