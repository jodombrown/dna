import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { checkRateLimit } from '@/lib/rateLimit';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useRateLimitedMutation<TData, TError, TVariables>(
  action: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check rate limit
      const rateLimitResult = checkRateLimit(user.id, action as any);

      if (!rateLimitResult.allowed) {
        const resetTime = rateLimitResult.resetAt.toLocaleTimeString();
        toast({
          title: 'Slow down!',
          description: `You're doing that too often. Try again after ${resetTime}.`,
          variant: 'destructive',
        });
        throw new Error('Rate limit exceeded');
      }

      // Proceed with mutation
      return mutationFn(variables);
    },
    ...options,
  });
}
