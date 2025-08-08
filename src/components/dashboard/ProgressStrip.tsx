import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function ProgressStrip() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = React.useRef<any>(null);

  const load = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.rpc('rpc_dashboard_counts');
      if (error) throw error;
      setData(data || {});
    } catch (e: any) {
      setError(e?.message || 'Data unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (!channelRef.current) {
      channelRef.current = supabase
        .channel('dash-strip')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, load)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, load)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'collaboration_memberships' }, load)
        .subscribe();
    }
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const Item = ({ label, value, href }: { label: string; value: number; href: string }) => (
    <a href={href} className="border rounded p-3 flex flex-col hover:bg-muted transition">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold">{value ?? 0}</div>
    </a>
  );

  if (loading && !data) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-destructive">{error}</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
      <Item label="Active spaces" value={data?.active_spaces || 0} href="/app/spaces" />
      <Item label="Pending joins" value={data?.pending_joins || 0} href="/app/spaces" />
      <Item label="Tasks due 7d" value={data?.tasks_due_7d || 0} href="/app/spaces" />
      <Item label="Saved opportunities" value={data?.saved_opportunities || 0} href="/app/opportunities" />
      <Item label="Unread notifications" value={data?.unread_notifications || 0} href="/app/dashboard" />
    </div>
  );
}
