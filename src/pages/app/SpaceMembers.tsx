import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SpaceMembers() {
  const { id } = useParams();
  const nav = useNavigate();
  const [approved, setApproved] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { document.title = 'Members | DNA'; }, [id]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const [a, p] = await Promise.all([
      supabase.from('collaboration_memberships').select('user_id, role, status, profiles:profiles!inner(username, full_name)')
        .eq('space_id', id).eq('status','approved'),
      supabase.from('collaboration_memberships').select('user_id, role, status, profiles:profiles!inner(username, full_name)')
        .eq('space_id', id).eq('status','pending')
    ]);
    setApproved(a.data || []);
    setPending(p.data || []);
    setLoading(false);
  };

  useEffect(() => { load();
    const ch = supabase.channel(`members:${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'collaboration_memberships', filter: `space_id=eq.${id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  const approve = async (uid: string) => { await supabase.rpc('rpc_membership_approve', { p_space: id, p_user: uid }); };
  const reject  = async (uid: string) => { await supabase.rpc('rpc_membership_reject',  { p_space: id, p_user: uid }); };
  const remove  = async (uid: string) => { await supabase.from('collaboration_memberships').delete().match({ space_id: id, user_id: uid }); };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={() => nav(`/app/spaces/${id}`)}>Back to Space</Button>
      <Card>
        <CardHeader><CardTitle>Members</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {loading ? 'Loading…' : (
            <>
              <div>
                <div className="font-semibold mb-2">Pending</div>
                {pending.length === 0 ? <div className="text-sm text-muted-foreground">No pending requests.</div> : (
                  <div className="space-y-2">
                    {pending.map(m => (
                      <div key={m.user_id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 text-sm">{m.profiles?.full_name || m.profiles?.username || m.user_id}</div>
                        <Button size="sm" onClick={() => approve(m.user_id)}>Approve</Button>
                        <Button size="sm" variant="outline" onClick={() => reject(m.user_id)}>Reject</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold mb-2">Approved</div>
                {approved.length === 0 ? <div className="text-sm text-muted-foreground">No members yet.</div> : (
                  <div className="space-y-2">
                    {approved.map(m => (
                      <div key={m.user_id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 text-sm">{m.profiles?.full_name || m.profiles?.username || m.user_id}</div>
                        <div className="text-xs text-muted-foreground">{m.role}</div>
                        <Button size="sm" variant="destructive" onClick={() => remove(m.user_id)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
