import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function RecommendationsWidget() {
  const [people, setPeople] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        setLoading(true);
        const [p, s, o] = await Promise.all([
          supabase.rpc('rpc_adin_recommend_people', { p_limit: 3 }),
          supabase.rpc('rpc_adin_recommend_spaces', { p_limit: 3 }),
          supabase.rpc('rpc_adin_recommend_opportunities', { p_limit: 3 })
        ]);
        if (p.error) throw p.error;
        if (s.error) throw s.error;
        if (o.error) throw o.error;
        setPeople(p.data || []);
        setSpaces(s.data || []);
        setOpps(o.data || []);
      } catch (e: any) {
        setError(e?.message || 'Recommendations unavailable');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="font-semibold">Recommendations</div>
        <div className="text-xs text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <div className="font-semibold">Recommendations</div>
        <div className="text-xs text-destructive">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="font-semibold">Recommendations</div>
      <div className="text-xs text-muted-foreground">Personalized by skills, sectors, and region</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <div className="text-xs font-medium mb-1">People</div>
          {people.length === 0 ? (
            <div className="text-xs text-muted-foreground">No matches yet.</div>
          ) : (
            people.map((p) => (
              <div key={p.user_id} className="text-xs truncate">
                {p.full_name || p.username}
              </div>
            ))
          )}
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Spaces</div>
          {spaces.length === 0 ? (
            <div className="text-xs text-muted-foreground">No matches yet.</div>
          ) : (
            spaces.map((s) => (
              <div key={s.id} className="text-xs truncate">
                {s.title}
              </div>
            ))
          )}
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Opportunities</div>
          {opps.length === 0 ? (
            <div className="text-xs text-muted-foreground">No matches yet.</div>
          ) : (
            opps.map((o) => (
              <div key={o.id} className="text-xs truncate">
                {o.title}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
