
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EventAction } from '@/types/eventTypes';

export const useEventActions = (onEventUpdated: () => void) => {
  const { toast } = useToast();

  const handleEventAction = useCallback(async (eventId: string, action: EventAction) => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);

        if (error) {
          throw error;
        }
        
        toast({
          title: "Event Deleted",
          description: "The event has been permanently deleted.",
        });
      } else if (action === 'feature' || action === 'unfeature') {
        // Note: is_featured is not in new schema yet, skip this for now
        toast({
          title: "Not Implemented",
          description: "Featured events will be supported in a future update.",
        });
      } else if (action === 'edit') {
        // Edit action is handled by the component that calls this hook
        // We don't need to do anything here, just return
        return;
      }

      onEventUpdated();
    } catch (error: any) {
      let errorMessage = `Failed to ${action} event`;
      if (error.message.includes('insufficient_privilege') || error.message.includes('permission denied')) {
        errorMessage = `You don't have permission to ${action} this event`;
      } else if (error.message) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast, onEventUpdated]);

  return { handleEventAction };
};
