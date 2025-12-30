import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMarkOnboardingComplete = () => {
  const { toast } = useToast();

  const markComplete = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Onboarding completed",
        description: "Welcome to DNA! Your profile setup is now complete.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error completing onboarding",
        description: "There was an issue completing your setup. Please try again.",
        variant: "destructive"
      });

      throw error;
    }
  };

  return { markComplete };
};