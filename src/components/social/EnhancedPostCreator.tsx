
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Calendar, 
  Users, 
  DollarSign,
  Send,
  Smile
} from 'lucide-react';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EnhancedPostCreator: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!user || !content.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: 'text',
          is_published: true,
          moderation_status: 'approved'
        });

      if (error) throw error;

      setContent('');
      toast({
        title: "Posted!",
        description: "Your post has been shared with the community",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Sign in to share with the diaspora community</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-dna-mint text-dna-forest">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="What's happening in the diaspora community?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-gray-200 focus:border-dna-emerald"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-dna-emerald">
                  <Image className="w-4 h-4 mr-1" />
                  Photo
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-dna-emerald">
                  <Calendar className="w-4 h-4 mr-1" />
                  Event
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-dna-emerald">
                  <Users className="w-4 h-4 mr-1" />
                  Community
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-dna-emerald">
                  <DollarSign className="w-4 h-4 mr-1" />
                  Opportunity
                </Button>
              </div>
              
              <Button 
                onClick={handlePost}
                disabled={!content.trim() || isPosting}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                {isPosting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isPosting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedPostCreator;
