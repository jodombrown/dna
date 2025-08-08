import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Recommendations() {
  const [people, setPeople] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, s, o] = await Promise.all([
      supabase.rpc('rpc_adin_recommend_people', { p_limit: 5 }),
      supabase.rpc('rpc_adin_recommend_spaces', { p_limit: 5 }),
      supabase.rpc('rpc_adin_recommend_opportunities', { p_limit: 5 })
    ]);
    setPeople(p.data || []);
    setSpaces(s.data || []);
    setOpps(o.data || []);
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'ADIN Recommendations | DNA';
    load();
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">ADIN Recommendations</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>People for you</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? 'Loading…' : people.length === 0 ? 'No matches yet.' : people.map((p: any) => (
              <div key={p.user_id} className="p-2 border rounded">
                <div className="font-medium">{p.full_name || p.username || 'Profile'}</div>
                <div className="text-xs text-muted-foreground">Score {p.score}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Spaces for you</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? 'Loading…' : spaces.length === 0 ? 'No matches yet.' : spaces.map((s: any) => (
              <div key={s.id} className="p-2 border rounded">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">Score {s.score}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Opportunities for you</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {loading ? 'Loading…' : opps.length === 0 ? 'No matches yet.' : opps.map((o: any) => (
              <div key={o.id} className="p-2 border rounded">
                <div className="font-medium">{o.title}</div>
                <div className="text-xs text-muted-foreground">{o.type} • Score {o.score}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
