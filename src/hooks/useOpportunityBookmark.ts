import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOpportunityBookmark = () => {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async ({ opportunityId, isBookmarked }: { opportunityId: string; isBookmarked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to bookmark opportunities');
      }

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('opportunity_bookmarks')
          .delete()
          .eq('opportunity_id', opportunityId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('opportunity_bookmarks')
          .insert({
            opportunity_id: opportunityId,
            user_id: user.id,
          });

        if (error) throw error;
      }

      return { opportunityId, isBookmarked: !isBookmarked };
    },
    onSuccess: ({ opportunityId, isBookmarked }) => {
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (isBookmarked) {
          newSet.add(opportunityId);
        } else {
          newSet.delete(opportunityId);
        }
        return newSet;
      });

      toast({
        title: isBookmarked ? "Bookmarked" : "Bookmark removed",
        description: isBookmarked 
          ? "This opportunity has been saved to your bookmarks." 
          : "This opportunity has been removed from your bookmarks.",
      });

      queryClient.invalidateQueries({ queryKey: ['bookmarked-opportunities'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleBookmark = (opportunityId: string) => {
    const isBookmarked = bookmarkedIds.has(opportunityId);
    bookmarkMutation.mutate({ opportunityId, isBookmarked });
  };

  return {
    bookmarkedIds,
    toggleBookmark,
    isBookmarking: bookmarkMutation.isPending,
  };
};
