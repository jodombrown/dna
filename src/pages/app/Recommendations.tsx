import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function Recommendations() {
  const [people, setPeople] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const [p, s, o] = await Promise.all([
        supabase.rpc('rpc_adin_recommend_people', { p_limit: 5 }),
        supabase.rpc('rpc_adin_recommend_spaces', { p_limit: 5 }),
        supabase.rpc('rpc_adin_recommend_opportunities', { p_limit: 5 })
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
  };
  useEffect(() => {
    document.title = 'ADIN Recommendations | DNA';
    load();
  }, []);

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-semibold">ADIN Recommendations</h1>
      {error ? <div className="text-sm text-destructive">{error}</div> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader><CardTitle>People for you</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? 'Loading…' : people.length === 0 ? 'No matches yet.' : people.map((p: any) => (
              <div key={p.user_id} className="p-3 border rounded">
                <div className="font-medium">{p.full_name || p.username || 'Profile'}</div>
                <div className="text-xs text-muted-foreground">Score {p.score}</div>
                {(p.why_skills?.length || p.why_sectors?.length || p.why_region) && (
                  <div className="text-xs mt-1">
                    Why: {p.why_skills?.length ? `Skills: ${p.why_skills.join(', ')}` : ''}{p.why_skills?.length && (p.why_sectors?.length || p.why_region) ? ' • ' : ''}{p.why_sectors?.length ? `Sectors: ${p.why_sectors.join(', ')}` : ''}{(p.why_region && (p.why_skills?.length || p.why_sectors?.length)) ? ' • ' : ''}{p.why_region ? 'Region match' : ''}{p.engagement_boost ? ` • Engagement +${p.engagement_boost}` : ''}
                  </div>
                )}
                <div className="mt-2">
                  {p.username ? (
                    <a className="text-xs underline" href={`/dna/${p.username}`}>View profile</a>
                  ) : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Spaces for you</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? 'Loading…' : spaces.length === 0 ? 'No matches yet.' : spaces.map((s: any) => (
              <div key={s.id} className="p-3 border rounded">
                <div className="font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">Score {s.score}</div>
                {(s.why_skills?.length || s.why_sectors?.length) && (
                  <div className="text-xs mt-1">
                    Why: {s.why_skills?.length ? `Skills: ${s.why_skills.join(', ')}` : ''}{s.why_skills?.length && s.why_sectors?.length ? ' • ' : ''}{s.why_sectors?.length ? `Sectors: ${s.why_sectors.join(', ')}` : ''}{s.engagement_boost ? ` • Engagement +${s.engagement_boost}` : ''}
                  </div>
                )}
                <div className="mt-2">
                  <a className="text-xs underline" href={`/app/spaces/${s.id}`}>View space</a>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader><CardTitle>Opportunities for you</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? 'Loading…' : opps.length === 0 ? 'No matches yet.' : opps.map((o: any) => (
              <div key={o.id} className="p-3 border rounded">
                <div className="font-medium">{o.title}</div>
                <div className="text-xs text-muted-foreground">{o.type} • Score {o.score}</div>
                {(o.why_skills?.length || o.why_sectors?.length || o.why_region) && (
                  <div className="text-xs mt-1">
                    Why: {o.why_skills?.length ? `Skills: ${o.why_skills.join(', ')}` : ''}{o.why_skills?.length && (o.why_sectors?.length || o.why_region) ? ' • ' : ''}{o.why_sectors?.length ? `Sectors: ${o.why_sectors.join(', ')}` : ''}{(o.why_region && (o.why_skills?.length || o.why_sectors?.length)) ? ' • ' : ''}{o.why_region ? 'Region match' : ''}{o.engagement_boost ? ` • Engagement +${o.engagement_boost}` : ''}
                  </div>
                )}
                <div className="mt-2">
                  <a className="text-xs underline" href={`/app/opportunities`}>View opportunity</a>{o.link ? <a className="text-xs underline ml-3" href={o.link} target="_blank" rel="noreferrer">Open link</a> : null}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
