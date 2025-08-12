import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type EventRow = { connection_id: string; event_type: string; created_at: string };

type HealthUpdate = { id: string; current: number; delta: number; reason: string };

const EVENT_WEIGHTS: Record<string, number> = {
  message: 2,
  share_resource: 3,
  intro_made: 4,
  attended_same_event: 5,
  coauthored_post: 5,
  task_completed: 3,
  nudge_accepted: 4,
  nudge_dismissed: -1,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const lookbackDays = 7;
    const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

    // 1) Fetch recent connection events
    const { data: events, error: evErr } = await supabase
      .from("connection_events")
      .select("connection_id,event_type,created_at")
      .gte("created_at", since)
      .limit(5000);

    if (evErr) throw evErr;

    const grouped = new Map<string, EventRow[]>();
    (events || []).forEach((e: EventRow) => {
      if (!grouped.has(e.connection_id)) grouped.set(e.connection_id, []);
      grouped.get(e.connection_id)!.push(e);
    });

    // 2) Pull current health for those connections
    const connIds = Array.from(grouped.keys());
    let updates: HealthUpdate[] = [];

    if (connIds.length > 0) {
      const { data: connections, error: cErr } = await supabase
        .from("connections")
        .select("id, adin_health")
        .in("id", connIds);
      if (cErr) throw cErr;

      const currentById = new Map<string, number>();
      (connections || []).forEach((c: any) => currentById.set(c.id, c.adin_health ?? 50));

      // 3) Compute delta per connection with basic decay
      for (const id of connIds) {
        const current = currentById.get(id) ?? 50;
        const evs = grouped.get(id) || [];
        let delta = -2; // base weekly decay
        let reasons: string[] = [];
        for (const e of evs) {
          const w = EVENT_WEIGHTS[e.event_type] ?? 0;
          delta += w;
          if (w !== 0) reasons.push(`${e.event_type}:${w}`);
        }
        const next = Math.max(0, Math.min(100, current + delta));
        updates.push({ id, current: next, delta, reason: reasons.slice(0, 6).join(", ") });
      }

      // 4) Batch updates
      for (const chunk of chunkArray(updates, 200)) {
        const { error: upErr } = await supabase
          .from("connections")
          .upsert(
            chunk.map((u) => ({ id: u.id, adin_health: u.current, adin_health_reason: `Δ${u.delta} from events: ${u.reason}` }))
          );
        if (upErr) throw upErr;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, processed: updates.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("adin-nightly-health error", err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) res.push(arr.slice(i, i + size));
  return res;
}
