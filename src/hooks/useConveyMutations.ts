import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { ConveyItemType, ConveyItemVisibility, ConveyItemStatus } from '@/types/conveyTypes';
import { useToast } from '@/hooks/use-toast';

interface CreateConveyItemData {
  type: ConveyItemType;
  title: string;
  subtitle?: string;
  body: string;
  visibility: ConveyItemVisibility;
  status: ConveyItemStatus;
  primary_space_id?: string;
  primary_event_id?: string;
  primary_need_id?: string;
  primary_offer_id?: string;
  primary_badge_id?: string;
  focus_areas?: string[];
  region?: string;
}

interface UpdateConveyItemData extends Partial<CreateConveyItemData> {
  id: string;
}

export function useCreateConveyItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateConveyItemData) => {
      // Generate slug from title
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data: user } = await supabaseClient.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const itemData = {
        ...data,
        slug,
        author_id: user.user.id,
        published_at: data.status === 'published' ? new Date().toISOString() : null,
      };

      const { data: item, error } = await supabaseClient
        .from('convey_items')
        .insert(itemData)
        .select()
        .single();

      if (error) throw error;

      return item;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['convey-feed'] });
      queryClient.invalidateQueries({ queryKey: ['space-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['event-convey-items'] });

      toast({
        title: item.status === 'published' ? 'Story published' : 'Draft saved',
        description: item.status === 'published' 
          ? 'Your story is now live.' 
          : 'Your draft has been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create story.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateConveyItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateConveyItemData) => {
      // If transitioning to published, set published_at
      if (updates.status === 'published') {
        const { data: current } = await supabaseClient
          .from('convey_items')
          .select('published_at')
          .eq('id', id)
          .single();

        if (current && !current.published_at) {
          updates = { ...updates, published_at: new Date().toISOString() } as any;
        }
      }

      const { data, error } = await supabaseClient
        .from('convey_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: ['convey-feed'] });
      queryClient.invalidateQueries({ queryKey: ['space-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['event-convey-items'] });
      queryClient.invalidateQueries({ queryKey: ['convey-item', item.slug] });

      toast({
        title: 'Story updated',
        description: 'Your changes have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update story.',
        variant: 'destructive',
      });
    },
  });
}

export function useCheckExistingImpactDraft() {
  return useMutation({
    mutationFn: async ({ spaceId, needId }: { spaceId: string; needId: string }) => {
      const { data: user } = await supabaseClient.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabaseClient
        .from('convey_items')
        .select('id, slug')
        .eq('type', 'impact')
        .eq('primary_space_id', spaceId)
        .eq('primary_need_id', needId)
        .eq('author_id', user.user.id)
        .eq('status', 'draft')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}
