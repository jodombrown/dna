import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePostActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePost = async (postId: string, content: string, mediaUrl?: string) => {
    setIsLoading(true);
    try {
      const updateData: any = { content };
      if (mediaUrl !== undefined) {
        updateData.media_url = mediaUrl;
      }

      const { error } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deletePost = async (postId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success", 
        description: "Post deleted successfully",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePost,
    deletePost,
    isLoading
  };
};