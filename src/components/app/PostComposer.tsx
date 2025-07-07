import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ImagePlus, Smile, AtSign, Hash, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from '@/hooks/useImageUpload';
import MobileOptimizedCard from '@/components/ui/mobile-optimized-card';
import MobileTouchButton from '@/components/ui/mobile-touch-button';
import { AdinService } from '@/services/adinService';

interface PostComposerProps {
  onPostCreated?: (postId: string, pillar: string) => void;
}

const PostComposer = ({ onPostCreated }: PostComposerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  // Common emojis for African diaspora posts
  const commonEmojis = ['🌍', '🌟', '✨', '💚', '❤️', '👏', '🙌', '💪', '🔥', '💯', '🚀', '🎉', '💡', '🤝', '👑', '🌱'];

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadImage(file);
    if (url) {
      setMediaUrl(url);
    }
  };

  const insertEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const insertAtSymbol = () => {
    setContent(prev => prev + '@');
  };

  const insertHashSymbol = () => {
    setContent(prev => prev + '#');
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts.",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Missing Content", 
        description: "Please write something to share.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Extract hashtags and mentions
      const hashtags = AdinService.extractHashtags(content);
      const mentions = AdinService.extractMentions(content);
      
      // Get user context for better classification
      const userContext = await AdinService.getUserContext(user.id);
      
      // Use ADIN to automatically classify the post
      const analysis = AdinService.analyzePost(content, hashtags, userContext || undefined);
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          pillar: analysis.pillar,
          author_id: user.id,
          visibility: 'public',
          media_url: mediaUrl,
          hashtags: hashtags.length > 0 ? hashtags : null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to create post');
      }

      // Update user's ADIN profile with engagement data
      await AdinService.updateUserProfile(user.id, analysis.pillar, analysis.keywords);

      // Reset form
      setContent('');
      setMediaUrl(null);
      
      // Callback to refresh feed
      onPostCreated?.(data.id, analysis.pillar);
      
      toast({
        title: "Post Created",
        description: `Your post has been shared and classified as ${analysis.pillar} content.`,
      });
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
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
            placeholder="What's happening in your African diaspora journey? Share your thoughts, experiences, or questions..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] sm:min-h-[120px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-sm sm:text-base placeholder:text-gray-500 leading-relaxed"
          />
          
          {/* Media Preview */}
          {mediaUrl && (
            <div className="relative animate-fade-in">
              <img 
                src={mediaUrl} 
                alt="Upload preview" 
                className="max-h-48 rounded-lg border"
              />
              <button
                onClick={() => setMediaUrl(null)}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Quick Actions & Emoji Picker */}
          <div className="flex items-center justify-between pt-3 border-t gap-2">
            <div className="flex items-center space-x-1">
              {/* Media Upload */}
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
                  className="text-gray-500 hover:text-dna-emerald text-xs sm:text-sm cursor-pointer p-2 hover-scale"
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </label>

              {/* Emoji Picker Toggle */}
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-dna-emerald text-xs sm:text-sm p-2 hover-scale"
              >
                <Smile className="h-4 w-4" />
              </Button>

              {/* Mention Button */}
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={insertAtSymbol}
                className="text-gray-500 hover:text-dna-copper text-xs sm:text-sm p-2 hover-scale"
              >
                <AtSign className="h-4 w-4" />
              </Button>

              {/* Hashtag Button */}
              <Button 
                type="button"
                variant="ghost" 
                size="sm" 
                onClick={insertHashSymbol}
                className="text-gray-500 hover:text-dna-forest text-xs sm:text-sm p-2 hover-scale"
              >
                <Hash className="h-4 w-4" />
              </Button>
            </div>
            
            <MobileTouchButton 
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || uploading}
              className="bg-dna-emerald hover:bg-dna-emerald/90 text-xs sm:text-sm px-6"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </MobileTouchButton>
          </div>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg animate-fade-in">
              {commonEmojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => insertEmoji(emoji)}
                  className="text-lg hover:scale-110 transition-transform p-1 rounded hover:bg-white"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Auto-tagging hint */}
          <div className="text-xs text-gray-500 italic">
            💡 ADIN will automatically tag your post for Connect, Collaborate, or Contribute based on your content
          </div>
        </div>
      </div>
    </MobileOptimizedCard>
  );
};

export default PostComposer;