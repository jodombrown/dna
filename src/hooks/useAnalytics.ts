import { supabase } from '@/integrations/supabase/client';

export type ConnectEventName =
  | 'connect_profile_completed_40_plus'
  | 'connect_request_sent'
  | 'connect_request_accepted'
  | 'connect_message_sent'
  | 'connect_conversation_started'
  | 'connect_nudge_shown'
  | 'connect_nudge_clicked'
  | 'connect_cross_movement_event_rsvp'
  | 'connect_cross_movement_space_join'
  | 'connect_cross_movement_opportunity_apply'
  | 'connect_discovery_filter_applied'
  | 'connect_profile_viewed'
  | 'connect_user_blocked'
  | 'connect_content_reported'
  | 'event_to_space_created'
  | 'group_to_space_created'
  | 'space_joined_from_event_view'
  | 'space_joined_from_group_view'
  | 'space_joined_from_suggestions';

export function useAnalytics() {
  const trackEvent = async (eventName: ConnectEventName, metadata?: any, route?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Use type assertion to bypass TypeScript strict checking
      // The analytics_events table exists but types haven't regenerated yet
      await (supabase as any).from('analytics_events').insert({
        user_id: user.id,
        event_name: eventName,
        event_metadata: metadata || null,
        route: route || window.location.pathname,
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  };
  return { trackEvent };
}
