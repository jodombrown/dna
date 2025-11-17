import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { toast } from 'sonner';
import { SpaceMemberRole } from '@/types/spaceTypes';
import { createSpacePost } from '@/lib/feedWriter';

export const useJoinSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await supabaseClient
        .from('space_members')
        .insert({
          space_id: spaceId,
          user_id: userId,
          role: 'contributor' as SpaceMemberRole,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['space-members'] });
      toast.success('Successfully joined space');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to join space');
    },
  });
};

export const useLeaveSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await supabaseClient
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['space-members'] });
      toast.success('Successfully left space');
    },
    onError: (error: any) => {
      if (error.message?.includes('last lead')) {
        toast.error('Cannot leave: You are the last lead in this space');
      } else {
        toast.error(error.message || 'Failed to leave space');
      }
    },
  });
};

export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ spaceId, userId, role }: { spaceId: string; userId: string; role: SpaceMemberRole }) => {
      const { error } = await supabaseClient
        .from('space_members')
        .update({ role })
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-members'] });
      toast.success('Member role updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update role');
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await supabaseClient
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-members'] });
      toast.success('Member removed');
    },
    onError: (error: any) => {
      if (error.message?.includes('last lead')) {
        toast.error('Cannot remove: This is the last lead in the space');
      } else {
        toast.error(error.message || 'Failed to remove member');
      }
    },
  });
};

export const useCreateSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (spaceData: any) => {
      const { data, error } = await supabaseClient
        .from('spaces')
        .insert(spaceData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (space) => {
      // Create feed post for new space
      try {
        const { data: user } = await supabaseClient.auth.getUser();
        if (user.user && space) {
          await createSpacePost({
            spaceId: space.id,
            spaceTitle: space.name,
            spaceDescription: space.description || undefined,
            authorId: user.user.id,
            imageUrl: space.cover_image || undefined,
          });
        }
      } catch (error) {
        console.error('Failed to create feed post for space:', error);
      }

      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['public-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast.success('Space created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create space');
    },
  });
};

export const useUpdateSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabaseClient
        .from('spaces')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['space'] });
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      toast.success('Space updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update space');
    },
  });
};
