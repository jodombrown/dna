import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Noti { id: string; title: string | null; body: string | null; metadata: any; created_at: string; read_at: string | null }

export default function Notifications() {
  const [items, setItems] = useState<Noti[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const ensureSeo = () => {
    document.title = 'Notifications | DNA';
    const desc = 'Your DNA notifications and updates.';
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href.split('?')[0]);
  };

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc('rpc_notifications_list', { p_limit: 100, p_offset: 0 });
    if (!error) setItems((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { ensureSeo(); load(); }, []);

  const markSelected = async (ids: string[]) => {
    if (ids.length === 0) return;
    setMarking(true);
    await supabase.rpc('rpc_notifications_mark_read', { p_ids: ids });
    setMarking(false);
    load();
  };

  const markAll = async () => {
    setMarking(true);
    await supabase.rpc('rpc_notifications_mark_all_read');
    setMarking(false);
    load();
  };

  const unreadIds = items.filter(i => !i.read_at).map(i => i.id);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={loading}>Refresh</Button>
          <Button onClick={markAll} disabled={marking || unreadIds.length === 0}>Mark all read</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading…</div>
          ) : items.length === 0 ? (
            <div>No notifications yet.</div>
          ) : (
            <ul className="divide-y">
              {items.map(n => (
                <li key={n.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{n.title || 'Notification'}</div>
                    {n.body && <div className="text-sm text-muted-foreground mt-0.5">{n.body}</div>}
                    <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div className="ml-3">
                    {n.read_at ? (
                      <span className="text-xs text-muted-foreground">Read</span>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => markSelected([n.id])} disabled={marking}>Mark read</Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
