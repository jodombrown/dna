
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
        console.log('Attempting to', action, 'event:', eventId);
        const { error } = await supabase
          .from('events')
          .update({ is_featured: action === 'feature' })
          .eq('id', eventId);
        
        if (error) {
          console.error('Feature toggle error:', error);
          throw error;
        }
        
        toast({
          title: action === 'feature' ? "Event Featured" : "Event Unfeatured",
          description: `The event has been ${action === 'feature' ? 'featured' : 'unfeatured'}.`,
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
