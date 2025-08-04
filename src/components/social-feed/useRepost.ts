import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRepost = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createRepost = async (
    sharedPostId: string, 
    commentary: string, 
    pillar: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content: commentary.trim(),
          shared_post_id: sharedPostId,
          author_id: user.id,
          user_id: user.id, // Required field
          pillar: pillar,
          type: 'repost',
          visibility: 'public'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post shared successfully",
      });

      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to share post",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createRepost,
    isLoading
  };
};