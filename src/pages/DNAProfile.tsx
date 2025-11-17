import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProfileViewTracker } from '@/components/analytics/ProfileViewTracker';
import { UniversalFeed } from '@/components/feed/UniversalFeed';
import { useAuth } from '@/contexts/AuthContext';

export default function DNAProfile() {
  const { username } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bundle, setBundle] = useState<any>(null);
  const [type, setType] = useState<'all'|'task'|'milestone'|'post'|'opportunity'>('all');
  const [days, setDays] = useState('365');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('rpc_public_profile_bundle', { p_username: username });
    setBundle(data);
    setLoading(false);
  };

  useEffect(() => { 
    document.title = `DNA Profile | ${username}`; 
    load(); 
  }, [username]);

  if (loading) return <div className="max-w-5xl mx-auto p-4">Loading…</div>;
  if (!bundle || !bundle.found) return <div className="max-w-5xl mx-auto p-4">Profile not available.</div>;

  const p = bundle.profile || {};
  const allContrib = (bundle.contributions || []) as any[];
  const cutoff = useMemo(() => {
    const d = Number(days) || 365; 
    const dt = new Date(); 
    dt.setDate(dt.getDate() - d); 
    return dt;
  }, [days]);

  const contributions = allContrib.filter(c => {
    const okType = type === 'all' ? true : c.type === type;
    const okTime = new Date(c.created_at) >= cutoff;
    return okType && okTime;
  });

  const badges = bundle.badges || [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Track profile views */}
      {p.id && <ProfileViewTracker profileId={p.id} viewType="profile_page" />}
      
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {p.avatar_url ? (
              <img 
                src={p.avatar_url} 
                alt={`${p.full_name || p.username} avatar`} 
                className="w-24 h-24 rounded-full object-cover" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200" />
            )}
            <div className="flex-1 space-y-1">
              <div className="text-xl font-semibold">{p.full_name || p.username}</div>
              {p.headline && <div className="text-sm text-muted-foreground">{p.headline}</div>}
              {p.region && <div className="text-sm">{p.region}</div>}
              {Array.isArray(p.skills) && p.skills.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Skills:</span> {p.skills.join(', ')}
                </div>
              )}
              {Array.isArray(p.impact_areas) && p.impact_areas.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium">Impact areas:</span> {p.impact_areas.join(', ')}
                </div>
              )}
              {p.bio && <p className="text-sm leading-relaxed mt-2 whitespace-pre-wrap">{p.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why verified</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Contributions are recorded automatically when you create or complete tasks and milestones, publish posts, or open opportunities. Entries come from server-side triggers and cannot be edited by other users.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Verified contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="opportunity">Opportunities</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <span className="text-xs">Since days</span>
                <Input 
                  className="w-24" 
                  value={days} 
                  onChange={e => setDays(e.target.value)} 
                />
              </div>
            </div>
            {contributions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No contributions match your filters.
              </div>
            ) : (
              <div className="space-y-2">
                {contributions.map((c: any) => (
                  <div key={c.id} className="p-3 border rounded">
                    <div className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                    <div className="text-sm font-medium">
                      {c.type}{c.description ? ` • ${c.description}` : ''}
                    </div>
                    {(c.sector || c.region) && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {[c.sector, c.region].filter(Boolean).join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No badges awarded yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {badges.map((b: any) => (
                  <div key={b.id} className="p-3 border rounded">
                    <div className="text-sm font-medium">
                      {b.badge_name || b.badge_type}
                    </div>
                    {b.description && (
                      <div className="text-xs text-muted-foreground">{b.description}</div>
                    )}
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {new Date(b.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}