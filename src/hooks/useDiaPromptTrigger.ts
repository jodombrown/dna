import { supabase } from '@/integrations/supabase/client'

export const useDiaPromptTrigger = () => {
  const triggerDiaPrompt = async (userId: string, eventType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('trigger-dia-prompt', {
        body: { user_id: userId, event_type: eventType }
      })

      if (error) {
        console.error('Error triggering DIA prompt:', error)
        return { success: false, error }
      }

      console.log('DIA prompt triggered successfully:', data)
      return { success: true, data }
    } catch (error) {
      console.error('Failed to trigger DIA prompt:', error)
      return { success: false, error }
    }
  }

  return { triggerDiaPrompt }
}
