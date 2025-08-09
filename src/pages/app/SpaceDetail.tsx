import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TaskList from '@/components/spaces/TaskList';
import { useAuth } from '@/contexts/AuthContext';

type Space = { id: string; title: string; description: string | null; visibility: string; status: string; tags: string[]|null; created_by: string };

type Milestone = { id: string; title: string; status: string; due_date: string|null };

const guard = (res: { data: any; error: any }, msg = 'Action failed') => { if (res.error) { console.error(res.error); throw new Error(msg); } return res.data ?? []; };

export default function SpaceDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const [space, setSpace] = useState<Space|null>(null);
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msTitle, setMsTitle] = useState('');
  const [msDue, setMsDue] = useState('');

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const s = await supabase.from('collaboration_spaces').select('*').eq('id', id).single();
      const spaceData = guard(s, 'Space not found') as Space;
      setSpace(spaceData);
      const m = await supabase.from('milestones').select('*').eq('space_id', id).order('updated_at', { ascending: false });
      setMilestones(guard(m, 'No access to milestones') as Milestone[]);
      setAccessDenied(false);
    } catch {
      setMilestones([]); setAccessDenied(true);
    } finally { setLoading(false); }
  };

  useEffect(() => { document.title = 'Space | DNA'; fetchAll(); }, [id]);

  useEffect(() => {
    if (!id) return;
    const ch = supabase
      .channel(`space:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `space_id=eq.${id}` }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `space_id=eq.${id}` }, fetchAll)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const requestJoin = async () => {
    if (!id || !user) return;
    const { error } = await supabase.from('collaboration_memberships').insert({ space_id: id, user_id: user.id, role: 'member', status: 'pending' });
    if (error) alert('Join request failed'); else alert('Join request sent');
  };



  const addMilestone = async () => {
    if (!id || !msTitle.trim() || !user) return;
    await supabase.from('milestones').insert({ 
      space_id: id, 
      title: msTitle.trim(), 
      description: null,
      status: 'planned', 
      due_date: msDue || null,
      created_by: user.id
    });
    await supabase.rpc('rpc_log_contribution', { p_type: 'milestone', p_target_id: id, p_target_title: msTitle, p_metadata: { action: 'created' } });
    setMsTitle(''); setMsDue(''); fetchAll();
  };

  const isPrivate = space?.visibility === 'private';

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <Button variant="outline" onClick={() => nav('/app/spaces')}>Back to Spaces</Button>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {space?.title || 'Space'}
            {isPrivate ? <Badge variant="secondary">Private</Badge> : <Badge>Public</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : accessDenied ? (
            <div className="p-4 border rounded bg-amber-50">
              <div className="font-medium mb-2">This space is private</div>
              <p className="mb-3">Request to join to view tasks and milestones.</p>
              <Button onClick={requestJoin}>Request to Join</Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">{space?.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {id && <TaskList spaceId={id} />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle>Milestones</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-2">
                      <Input placeholder="Milestone title" value={msTitle} onChange={e => setMsTitle(e.target.value)} />
                      <Input type="date" value={msDue} onChange={e => setMsDue(e.target.value)} className="w-40" />
                      <Button onClick={addMilestone}>Add</Button>
                    </div>
                    {milestones.length === 0 ? <div className="text-sm text-muted-foreground">No milestones yet.</div> : (
                      <ul className="space-y-2">
                        {milestones.map(m => (
                          <li key={m.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <div className="font-medium">{m.title}</div>
                              <div className="text-xs text-muted-foreground">{m.status}{m.due_date ? ` • due ${m.due_date}` : ''}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
