import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateUsername = () => {
  const { toast } = useToast();

  const updateUsername = async (newUsername: string) => {
    try {
      const { data, error } = await supabase.rpc('update_username', {
        new_username: newUsername,
      });

      if (error) {
        throw error;
      }

      // Handle response from the RPC function
      const result = data as any;
      if (result && !result.success) {
        throw new Error(result.error || 'Failed to update username');
      }

      toast({
        title: "Username updated",
        description: `Your username has been changed to @${newUsername}. ${result.changes_remaining} change(s) remaining.`,
      });

      return { 
        success: true, 
        changesRemaining: result.changes_remaining 
      };
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update username';
      
      toast({
        title: "Username update failed",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    }
  };

  return { updateUsername };
};