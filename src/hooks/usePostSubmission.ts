import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadMedia } from '@/lib/uploadMedia';

interface PostSubmissionData {
  content: string;
  pillar: string;
  type: string;
  file?: File | null;
  embedData?: any;
  pollOptions?: string[];
  opportunityType?: string;
  opportunityLink?: string;
}

export const usePostSubmission = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitPost = async (data: PostSubmissionData): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate content
      if (!data.content.trim() && !data.file && !data.embedData) {
        toast({
          title: "Content required",
          description: "Please add some content, media, or a link to your post.",
          variant: "destructive",
        });
        return false;
      }

      let mediaUrl: string | null = null;
      
      // Upload media if present
      if (data.file) {
        try {
          mediaUrl = await uploadMedia(data.file, user.id, 'post-media');
        } catch (error) {
          console.error('Media upload failed:', error);
          toast({
            title: "Upload failed",
            description: "Failed to upload media. Please try again.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Determine final post type
      let finalType = data.type;
      if (data.file?.type.startsWith('image/')) {
        finalType = 'image';
      } else if (data.file?.type.startsWith('video/')) {
        finalType = 'video';
      } else if (data.embedData) {
        finalType = 'link';
      }

      // Prepare post payload
      const postPayload: any = {
        author_id: user.id, // This field is required by RLS policy
        user_id: user.id,   // Keep this for backward compatibility
        content: data.content.trim() || null,
        pillar: data.pillar,
        type: finalType,
        media_url: mediaUrl,
        embed_metadata: data.embedData || null,
        visibility: 'public',
        status: 'published'
      };

      // Add type-specific fields
      if (finalType === 'poll' && data.pollOptions) {
        postPayload.poll_options = data.pollOptions.filter(option => option.trim());
        postPayload.poll_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }

      if (finalType === 'opportunity') {
        postPayload.opportunity_type = data.opportunityType;
        postPayload.opportunity_link = data.opportunityLink;
      }

      if (data.embedData?.url) {
        postPayload.link_url = data.embedData.url;
      }

      // Insert post
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(postPayload)
        .select()
        .single();

      if (error) {
        console.error('Post creation error:', error);
        throw error;
      }

      toast({
        title: "Post published!",
        description: "Your post has been shared with the community.",
      });

      return true;
    } catch (error) {
      console.error('Submit post error:', error);
      toast({
        title: "Failed to publish",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitPost,
    isSubmitting
  };
};