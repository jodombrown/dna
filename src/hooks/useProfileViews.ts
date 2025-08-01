import { supabase } from '@/integrations/supabase/client'
import { useAdinPromptTrigger } from './useAdinPromptTrigger'

export const useProfileViews = () => {
  const { triggerAdinPrompt } = useAdinPromptTrigger()

  const trackProfileView = async (profileId: string, viewerId?: string) => {
    try {
      // Track the profile view
      const { error } = await supabase
        .from('profile_views')
        .insert({
          profile_id: profileId,
          viewer_id: viewerId || null,
          ip_address: null, // Could be populated with actual IP if needed
          user_agent: navigator.userAgent
        })

      if (error) {
        console.error('Error tracking profile view:', error)
        return
      }

      // Check if this profile has crossed view thresholds
      const { data: viewCount } = await supabase
        .from('profile_views')
        .select('id', { count: 'exact' })
        .eq('profile_id', profileId)

      // Trigger ADIN prompt for view milestones (e.g., 10, 50, 100 views)
      const count = viewCount?.length || 0
      if ([10, 50, 100, 250, 500].includes(count)) {
        triggerAdinPrompt(profileId, `profile_views_${count}`)
      }

    } catch (error) {
      console.error('Failed to track profile view:', error)
    }
  }

  return { trackProfileView }
}