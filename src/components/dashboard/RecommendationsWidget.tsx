import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function RecommendationsWidget() {
  const [people, setPeople] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, s, o] = await Promise.all([
        supabase.rpc('rpc_adin_recommend_people', { p_limit: 3 }),
        supabase.rpc('rpc_adin_recommend_spaces', { p_limit: 3 }),
        supabase.rpc('rpc_adin_recommend_opportunities', { p_limit: 3 })
      ]);
      setPeople(p.data || []);
      setSpaces(s.data || []);
      setOpps(o.data || []);
    })();
  }, []);

  return (
    <section className="space-y-2">
      <div className="font-semibold">Recommendations</div>
      <div className="text-xs text-muted-foreground">Personalized by skills, impact areas, and location</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <div className="text-xs font-medium mb-1">People</div>
          {people.map((p: any) => (
            <div key={p.user_id} className="text-xs truncate">{p.full_name || p.username}</div>
          ))}
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Spaces</div>
          {spaces.map((s: any) => (
            <div key={s.id} className="text-xs truncate">{s.title}</div>
          ))}
        </div>
        <div>
          <div className="text-xs font-medium mb-1">Opportunities</div>
          {opps.map((o: any) => (
            <div key={o.id} className="text-xs truncate">{o.title}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
