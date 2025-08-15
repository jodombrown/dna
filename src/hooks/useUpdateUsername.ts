import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useUpdateUsername = () => {
  const { toast } = useToast();

  const updateUsername = async (newUsername: string) => {
    try {
      const { error } = await supabase.rpc('update_username', {
        new_username: newUsername,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Username updated",
        description: `Your username has been changed to @${newUsername}`,
      });

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Failed to update username';
      
      // Handle duplicate username error with friendly message
      if (error.message?.includes('duplicate key value') || 
          error.message?.includes('profiles_username_ci_idx') ||
          error.code === '23505') {
        errorMessage = 'This username is already taken. Please choose a different one.';
      } else {
        errorMessage = error.message || 'Failed to update username';
      }
      
      toast({
        title: "Username update failed",
        description: errorMessage,
        variant: "destructive"
      });

      throw error;
    }
  };

  return { updateUsername };
};