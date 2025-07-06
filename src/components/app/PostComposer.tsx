import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ImagePlus, Users, Handshake, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostComposerProps {
  onPostCreated?: (postId: string, pillar: string) => void;
}

const PostComposer = ({ onPostCreated }: PostComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<'connect' | 'collaborate' | 'contribute' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pillars = [
    { 
      key: 'connect' as const, 
      label: 'Connect', 
      icon: Users, 
      color: 'dna-emerald',
      bgClass: 'bg-dna-emerald/10 text-dna-emerald hover:bg-dna-emerald/20' 
    },
    { 
      key: 'collaborate' as const, 
      label: 'Collaborate', 
      icon: Handshake, 
      color: 'dna-copper',
      bgClass: 'bg-dna-copper/10 text-dna-copper hover:bg-dna-copper/20' 
    },
    { 
      key: 'contribute' as const, 
      label: 'Contribute', 
      icon: Heart, 
      color: 'dna-forest',
      bgClass: 'bg-dna-forest/10 text-dna-forest hover:bg-dna-forest/20' 
    }
  ];

  const handleSubmit = async () => {
    if (!content.trim() || !selectedPillar || !user) {
      toast({
        title: "Missing Information",
        description: "Please write something and select a pillar.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          pillar: selectedPillar,
          author_id: user.id,
          visibility: 'public'
        })
        .select('id')
        .single();

      if (error) throw error;

      setContent('');
      setSelectedPillar(null);
      onPostCreated?.(data.id, selectedPillar);
      
      toast({
        title: "Post Created",
        description: "Your post has been shared with the DNA community.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-dna-emerald text-white">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3">
            <Textarea
              placeholder="What's on your mind about Africa's future?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base placeholder:text-gray-500"
            />
            
            <div className="flex flex-wrap gap-2">
              {pillars.map((pillar) => {
                const Icon = pillar.icon;
                const isSelected = selectedPillar === pillar.key;
                
                return (
                  <Badge
                    key={pillar.key}
                    variant="secondary"
                    className={`cursor-pointer transition-colors ${
                      isSelected 
                        ? pillar.bgClass + ' ring-2 ring-offset-2 ring-' + pillar.color
                        : pillar.bgClass
                    }`}
                    onClick={() => setSelectedPillar(isSelected ? null : pillar.key)}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {pillar.label}
                  </Badge>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                <ImagePlus className="h-4 w-4 mr-2" />
                Add Media
              </Button>
              
              <Button 
                onClick={handleSubmit}
                disabled={!content.trim() || !selectedPillar || isSubmitting}
                className="bg-dna-emerald hover:bg-dna-emerald/90"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostComposer;