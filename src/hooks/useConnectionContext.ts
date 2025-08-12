import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ConnectionContext = {
  connectionId: string;
  intentions: any[];
  preferences: any | null; // current user’s prefs
  health: number;
  nextNudges: any[];
  loading: boolean;
  setIntention: (args: { type: string; notes?: string; visibility?: "shared" | "private" }) => Promise<void>;
  setCadence: (cadence: "off" | "low" | "medium" | "high" | "quiet" | "standard" | "builder") => Promise<void>;
  resolveNudge: (nudgeId: string, status: "accepted" | "dismissed" | "snoozed", snoozeUntil?: string) => Promise<void>;
};

export function useConnectionContext(connectionId: string): ConnectionContext {
  const [intentions, setIntentions] = useState<any[]>([]);
  const [preferences, setPreferences] = useState<any | null>(null);
  const [health, setHealth] = useState<number>(50);
  const [nextNudges, setNextNudges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);

      const [{ data: conn }, { data: ints }, { data: prefs }, { data: nudges }] = await Promise.all([
        supabase.from("connections").select("id, adin_health").eq("id", connectionId).maybeSingle(),
        supabase
          .from("connection_intentions")
          .select("*")
          .eq("connection_id", connectionId)
          .order("created_at", { ascending: false }),
        supabase.from("connection_preferences").select("*").eq("connection_id", connectionId),
        supabase
          .from("adin_nudges")
          .select("*")
          .eq("connection_id", connectionId)
          .eq("status", "sent")
          .order("created_at", { ascending: true }),
      ]);

      if (!mounted) return;

      setHealth(conn?.adin_health ?? 50);
      setIntentions(ints ?? []);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const myPref = (prefs ?? []).find((p: any) => p.user_id === user?.id) ?? null;
      setPreferences(myPref);
      setNextNudges(nudges ?? []);
      setLoading(false);
    };

    run();
    return () => {
      mounted = false;
    };
  }, [connectionId, refreshKey]);

  const setIntention = async ({
    type,
    notes,
    visibility = "shared",
  }: {
    type: string;
    notes?: string;
    visibility?: "shared" | "private";
  }) => {
    await supabase.rpc("set_connection_intention", {
      p_connection: connectionId,
      p_type: type,
      p_notes: notes ?? null,
      p_visibility: visibility,
    });
    setRefreshKey((k) => k + 1);
  };

  const setCadence = async (
    cadence: "off" | "low" | "medium" | "high" | "quiet" | "standard" | "builder"
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("connection_preferences")
      .upsert(
        {
          connection_id: connectionId,
          user_id: user?.id,
          nudge_cadence: cadence,
        },
        { onConflict: "connection_id, user_id" }
      )
      .select("*")
      .maybeSingle();

    if (!error) {
      setPreferences(data ?? { connection_id: connectionId, user_id: user?.id, nudge_cadence: cadence });
    }
  };

  const resolveNudge = async (
    nudgeId: string,
    status: "accepted" | "dismissed" | "snoozed",
    snoozeUntil?: string
  ) => {
    await supabase.rpc("resolve_nudge", { p_nudge: nudgeId, p_status: status, p_snooze_until: snoozeUntil ?? null });
    setNextNudges((prev) => prev.filter((n) => n.id !== nudgeId));
  };

  return useMemo(
    () => ({
      connectionId,
      intentions,
      preferences,
      health,
      nextNudges,
      loading,
      setIntention,
      setCadence,
      resolveNudge,
    }),
    [connectionId, intentions, preferences, health, nextNudges, loading]
  );
}
