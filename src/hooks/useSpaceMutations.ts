import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SpaceMemberRole } from '@/types/spaceTypes';

export const useJoinSpace = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const { error } = await (supabase
        .from('space_members')
        .insert({
          space_id: spaceId,
          user_id: userId,
          role: 'contributor' as SpaceMemberRole,
          joined_at: new Date().toISOString(),
        }) as any);

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
      const { error } = await (supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId) as any);

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
      const { error } = await (supabase
        .from('space_members')
        .update({ role })
        .eq('space_id', spaceId)
        .eq('user_id', userId) as any);

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
      const { error } = await (supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', userId) as any);

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
      const { data, error } = await (supabase
        .from('spaces')
        .insert(spaceData)
        .select()
        .single() as any);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-spaces'] });
      queryClient.invalidateQueries({ queryKey: ['public-spaces'] });
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
      const { error } = await (supabase
        .from('spaces')
        .update(updates)
        .eq('id', id) as any);

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
