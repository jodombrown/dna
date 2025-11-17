import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseClient } from '@/lib/supabaseHelpers';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { checkRateLimit } from '@/lib/rateLimit';
import { createNeedPost } from '@/lib/feedWriter';

interface CreateNeedVariables {
  spaceId: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  targetAmount?: number;
  currency?: string;
  timeCommitment?: string;
  duration?: string;
  neededBy?: string;
  focusAreas?: string[];
  region?: string;
}

interface CreateOfferVariables {
  needId: string;
  spaceId: string;
  message: string;
  offeredAmount?: number;
  offeredCurrency?: string;
}

interface UpdateOfferStatusVariables {
  offerId: string;
  status: 'accepted' | 'declined' | 'completed' | 'validated';
}

export function useCreateNeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateNeedVariables) => {
      if (!user) throw new Error('Not authenticated');

      // Check rate limit
      const rateLimitResult = checkRateLimit(user.id, 'create_contribution_need');
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetAt.toLocaleTimeString();
        throw new Error(`Rate limit exceeded. You can create more needs after ${resetTime}.`);
      }

      const { data, error } = await supabaseClient
        .from('contribution_needs')
        .insert({
          space_id: variables.spaceId,
          created_by: user.id,
          type: variables.type,
          title: variables.title,
          description: variables.description,
          priority: variables.priority,
          target_amount: variables.targetAmount,
          currency: variables.currency,
          time_commitment: variables.timeCommitment,
          duration: variables.duration,
          needed_by: variables.neededBy,
          focus_areas: variables.focusAreas,
          region: variables.region,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      // Create feed post for new need
      try {
        if (user) {
          await createNeedPost({
            needId: data.id,
            needTitle: data.title,
            needDescription: data.description,
            needType: data.type as any,
            authorId: user.id,
            spaceId: data.space_id,
          });
        }
      } catch (error) {
        console.error('Failed to create feed post for need:', error);
      }

      queryClient.invalidateQueries({ queryKey: ['contribution-needs'] });
      queryClient.invalidateQueries({ queryKey: ['space-needs', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['universal-feed'] });
      toast({
        title: 'Need created',
        description: 'Your contribution need has been posted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create need',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateOffer() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateOfferVariables) => {
      if (!user) throw new Error('Not authenticated');

      // Check rate limit
      const rateLimitResult = checkRateLimit(user.id, 'create_contribution_offer');
      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetAt.toLocaleTimeString();
        throw new Error(`Rate limit exceeded. You can make more offers after ${resetTime}.`);
      }

      const { data, error } = await supabaseClient
        .from('contribution_offers')
        .insert({
          need_id: variables.needId,
          space_id: variables.spaceId,
          created_by: user.id,
          message: variables.message,
          offered_amount: variables.offeredAmount,
          offered_currency: variables.offeredCurrency,
        })
        .select()
        .single();

      if (error) {
        // Check for blocking error
        if (error.message?.includes('blocked') || error.code === '42501') {
          throw new Error('You cannot contribute to this space. You may have been blocked by the space lead.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contribution-offers'] });
      queryClient.invalidateQueries({ queryKey: ['need-offers', data.need_id] });
      queryClient.invalidateQueries({ queryKey: ['my-contributions'] });
      toast({
        title: 'Offer submitted',
        description: 'Your offer has been sent to the project leads for review.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to submit offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateOfferStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: UpdateOfferStatusVariables) => {
      const { data, error } = await supabaseClient
        .from('contribution_offers')
        .update({ status: variables.status })
        .eq('id', variables.offerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contribution-offers'] });
      queryClient.invalidateQueries({ queryKey: ['need-offers', data.need_id] });
      toast({
        title: 'Offer updated',
        description: `Offer has been ${data.status}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update offer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
