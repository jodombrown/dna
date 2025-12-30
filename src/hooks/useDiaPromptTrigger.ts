import { supabase } from '@/integrations/supabase/client'

export const useDiaPromptTrigger = () => {
  const triggerDiaPrompt = async (userId: string, eventType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('trigger-dia-prompt', {
        body: { user_id: userId, event_type: eventType }
      })

      if (error) {
        return { success: false, error }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error }
    }
  }

  return { triggerDiaPrompt }
}
