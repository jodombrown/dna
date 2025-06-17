import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Image, 
  Calendar, 
  Users, 
  FileText,
  Send,
  Globe
} from 'lucide-react';

interface PostCreatorProps {
  onPostCreated: (post: any) => void;
}

const PostCreator: React.FC<PostCreatorProps> = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'article' | 'event_share'>('text');
  const [isPosting, setIsPosting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, professional_role, company')
        .eq('id', user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handlePost = async () => {
    if (!content.trim() || !user) return;

    setIsPosting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim(),
          post_type: postType
        })
        .select(`
          *,
          profiles (
            full_name,
            avatar_url,
            professional_role,
            company
          )
        `)
        .single();

      if (error) throw error;

      onPostCreated(data);
      setContent('');
      toast({
        title: "Post shared!",
        description: "Your post has been shared with the DNA community."
      });
    } catch (error: any) {
      console.error('Error posting:', error);
      toast({
        title: "Error posting",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card className="border-2 border-dna-mint/20 hover:border-dna-mint/40 transition-colors">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-dna-copper text-white">
              {profile?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder="Share your thoughts with the DNA community..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-gray-200 focus:border-dna-emerald"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dna-forest hover:bg-dna-mint/20"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Photo
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dna-forest hover:bg-dna-mint/20"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Event
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-dna-forest hover:bg-dna-mint/20"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Article
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  <span>Anyone</span>
                </div>
                <Button
                  onClick={handlePost}
                  disabled={!content.trim() || isPosting}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
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
