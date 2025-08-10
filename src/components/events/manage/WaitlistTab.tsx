import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UsersIcon, ArrowUpCircle, Trash2 } from 'lucide-react';

interface WaitlistEntry {
  user_id: string;
  position: number;
  created_at: string;
  username?: string;
  full_name?: string;
}

interface WaitlistTabProps { eventId: string; }

const WaitlistTab: React.FC<WaitlistTabProps> = ({ eventId }) => {
  const [rows, setRows] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_waitlist')
        .select('user_id, position, created_at')
        .eq('event_id', eventId)
        .order('position', { ascending: true });
      if (error) throw error;

      const ids = (data || []).map(d => d.user_id);
      let profilesMap: Record<string, { username: string; full_name: string }> = {};
      if (ids.length) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('id, username, full_name')
          .in('id', ids);
        if (pErr) throw pErr;
        profilesMap = (profiles || []).reduce((acc: any, p: any) => {
          acc[p.id] = { username: p.username || 'unknown', full_name: p.full_name || p.username || 'Unknown' };
          return acc;
        }, {} as Record<string, { username: string; full_name: string }>);
      }

      setRows((data || []).map(d => ({
        ...d,
        username: profilesMap[d.user_id]?.username,
        full_name: profilesMap[d.user_id]?.full_name,
      })));
    } catch (e) {
      console.error(e);
      toast.error('Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const promoteNext = async () => {
    try {
      setPromoting(true);
      const { data, error } = await supabase.rpc('rpc_event_waitlist_promote', { p_event: eventId });
      if (error) throw error;
      if (data) toast.success('Promoted next in waitlist'); else toast.message('No one on waitlist');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to promote from waitlist');
    } finally {
      setPromoting(false);
    }
  };

  const promoteUser = async (userId: string) => {
    try {
      setPromoting(true);
      const { error } = await supabase.rpc('rpc_event_waitlist_promote', { p_event: eventId, p_user: userId });
      if (error) throw error;
      toast.success('User promoted from waitlist');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to promote user');
    } finally {
      setPromoting(false);
    }
  };

  const removeUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('event_waitlist')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);
      if (error) throw error;
      toast.success('Removed from waitlist');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Failed to remove from waitlist');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Loading waitlist...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Waitlist</CardTitle>
          <Button onClick={promoteNext} disabled={promoting}> 
            <ArrowUpCircle className="w-4 h-4 mr-2" /> Promote Next
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.user_id}>
                    <TableCell>#{r.position}</TableCell>
                    <TableCell>{r.full_name || 'Unknown'}</TableCell>
                    <TableCell>@{r.username || 'unknown'}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => promoteUser(r.user_id)}>
                          <ArrowUpCircle className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeUser(r.user_id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {rows.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">No one on the waitlist yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistTab;
