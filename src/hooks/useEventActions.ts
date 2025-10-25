
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EventAction } from '@/types/eventTypes';

export const useEventActions = (onEventUpdated: () => void) => {
  const { toast } = useToast();

  const handleEventAction = useCallback(async (eventId: string, action: EventAction) => {
    console.log('Event action:', action, 'for event:', eventId);
    
    try {
      if (action === 'delete') {
        console.log('Attempting to delete event:', eventId);
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventId);
        
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
        
        toast({
          title: "Event Deleted",
          description: "The event has been permanently deleted.",
        });
      } else if (action === 'feature' || action === 'unfeature') {
        // Note: is_featured is not in new schema yet, skip this for now
        console.log('Feature/unfeature not implemented in new schema yet');
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
      console.error('Error updating event:', error);
      
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
