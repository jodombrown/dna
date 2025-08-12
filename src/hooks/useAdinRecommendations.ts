// src/hooks/useAdinRecommendations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdinRecommendations(forConnectionId?: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("adin_recommendations")
        .select("*")
        .order("score", { ascending: false })
        .limit(10);

      if (mounted) {
        setItems(data ?? []);
        setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [forConnectionId]);

  return { items, loading };
}
