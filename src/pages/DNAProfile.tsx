import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileViewTracker } from '@/components/analytics/ProfileViewTracker';
import { ProfileActivityFeed } from '@/components/profile/ProfileActivityFeed';
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
  const isOwnProfile = user?.id === p.id;
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

      <Tabs defaultValue="contributions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="contributions">Contributions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contributions">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Verified contributions</CardTitle>
              </CardHeader>
              <CardContent>
                {contributions.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No verified contributions in this time period.</p>
                ) : (
                  <div className="space-y-2">
                    {contributions.map((c: any, i: number) => (
                      <div
                        key={i}
                        className="text-sm border-l-2 border-primary pl-3 py-1"
                      >
                        <div className="font-medium">{c.title || 'Untitled'}</div>
                        <div className="text-muted-foreground text-xs">{c.type} · {new Date(c.created_at).toLocaleDateString()}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle>Filter</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Type</label>
                    <Select value={type} onValueChange={(v: any) => setType(v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="task">Tasks</SelectItem>
                        <SelectItem value="milestone">Milestones</SelectItem>
                        <SelectItem value="post">Posts</SelectItem>
                        <SelectItem value="opportunity">Opportunities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Days</label>
                    <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} min="1" />
                  </div>
                </CardContent>
              </Card>
              {badges.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    {badges.join(', ')}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="activity">
          {p.id && (
            <ProfileActivityFeed
              profileUserId={p.id}
              profileUsername={username || ''}
              isOwnProfile={isOwnProfile}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}