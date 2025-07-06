import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlus, Users, Handshake, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import MobileOptimizedCard from '@/components/ui/mobile-optimized-card';
import MobileTouchButton from '@/components/ui/mobile-touch-button';

interface PostComposerProps {
  onPostCreated?: (postId: string, pillar: string) => void;
}

const PostComposer = ({ onPostCreated }: PostComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<'connect' | 'collaborate' | 'contribute' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const { uploadImage, uploading } = useImageUpload();

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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      setMediaUrl(url);
    }
  };

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
          visibility: 'public',
          media_url: mediaUrl
        })
        .select('id')
        .single();

      if (error) throw error;

      setContent('');
      setSelectedPillar(null);
      setMediaUrl(null);
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
    <MobileOptimizedCard padding="md" touchOptimized={false}>
      <div className="flex space-x-3">
        <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-dna-emerald text-white text-sm">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 min-w-0">
          <Textarea
            placeholder="What's on your mind about Africa's future?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] sm:min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-sm sm:text-base placeholder:text-gray-500"
          />
          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative">
              <img 
                src={mediaUrl} 
                alt="Upload preview" 
                className="max-h-48 rounded-lg border"
              />
              <button
                onClick={() => setMediaUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
              >
                ×
              </button>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = selectedPillar === pillar.key;
              
              return (
                <Badge
                  key={pillar.key}
                  variant="secondary"
                  className={`cursor-pointer transition-colors text-xs touch-manipulation ${
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

          <div className="flex items-center justify-between pt-3 border-t gap-2">
            <div className="flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleMediaUpload}
                className="hidden"
                id="media-upload"
              />
              <label htmlFor="media-upload">
                <Button 
                  type="button"
                  variant="ghost" 
                  size="sm" 
                  disabled={uploading}
                  className="text-gray-500 hover:text-gray-700 text-xs sm:text-sm cursor-pointer p-2"
                >
                  <ImagePlus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {uploading ? 'Uploading...' : 'Add Media'}
                </Button>
              </label>
            </div>
            
            <MobileTouchButton 
              onClick={handleSubmit}
              disabled={!content.trim() || !selectedPillar || isSubmitting || uploading}
              className="bg-dna-emerald hover:bg-dna-emerald/90 text-xs sm:text-sm"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </MobileTouchButton>
          </div>
        </div>
      </div>
    </MobileOptimizedCard>
  );
};

export default PostComposer;