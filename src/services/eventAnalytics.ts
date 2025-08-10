import { supabase } from '@/integrations/supabase/client';

export type EventAnalyticsKind =
  | 'page_view'
  | 'ticket_select'
  | 'checkout_start'
  | 'payment_success'
  | 'payment_failed'
  | 'registration_success';

export async function trackEventAnalytics(eventId: string, kind: EventAnalyticsKind, payload?: Record<string, any>) {
  try {
    if (!eventId || !kind) return;
    await supabase.from('event_analytics').insert({
      event_id: eventId,
      kind,
      payload: payload || null,
    });
  } catch (e) {
    // Non-blocking
    console.warn('analytics insert failed', e);
  }
}
