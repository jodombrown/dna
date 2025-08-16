export async function track(event: string, payload?: Record<string, any>) {
  try {
    // Swap to your Supabase Edge Function when ready:
    // await supabase.functions.invoke('log_engagement_event', { body: { event, payload }});
    if (import.meta.env.DEV) console.debug("[analytics]", event, payload);
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[analytics error]", e);
  }
}