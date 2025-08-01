import { supabase } from '@/integrations/supabase/client'

export const useAdinPromptTrigger = () => {
  const triggerAdinPrompt = async (userId: string, eventType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('trigger-adin-prompt', {
        body: { user_id: userId, event_type: eventType }
      })

      if (error) {
        console.error('Error triggering ADIN prompt:', error)
        return { success: false, error }
      }

      console.log('ADIN prompt triggered successfully:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Failed to trigger ADIN prompt:', error)
      return { success: false, error }
    }
  }

  return { triggerAdinPrompt }
}