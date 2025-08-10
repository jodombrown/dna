import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ev, setEv] = useState<any>(null);
  const [count, setCount] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const evRes = await supabase.from('events').select('*').eq('id', id).maybeSingle();
    if (!evRes.error) setEv(evRes.data);
    const cRes = await supabase.rpc('rpc_event_attendee_count', { p_event: id });
    if (!cRes.error && typeof cRes.data === 'number') setCount(cRes.data);
    const { data: auth } = await supabase.auth.getUser();
    if (auth?.user?.id) {
      const myRes = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', auth.user.id)
        .maybeSingle();
      setIsRegistered(Boolean(myRes.data));
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = ev?.title ? `${ev.title} | DNA` : 'Event | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', ev?.description || 'Event details on Diaspora Network of Africa');
    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href);
    if (!link.parentNode) document.head.appendChild(link);
  }, [ev]);

  useEffect(() => { load(); }, [id]);

  const register = async () => {
    if (!id) return;
    setSaving(true);
    await supabase.rpc('rpc_event_register', { p_event: id });
    setSaving(false);
    load();
  };
  const unregister = async () => {
    if (!id) return;
    setSaving(true);
    await supabase.rpc('rpc_event_unregister', { p_event: id });
    setSaving(false);
    load();
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!ev) return <div className="p-4">Event not found</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <Button variant="outline" onClick={() => nav('/app/events')}>Back to Events</Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{ev.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">{ev.date_time ? new Date(ev.date_time).toLocaleString() : ''}</div>
          {ev.location && <div className="text-sm">{ev.location}</div>}
          {ev.type && <div className="text-sm">Type: {ev.type}</div>}
          {ev.description && <article className="mt-2 whitespace-pre-wrap">{ev.description}</article>}
          <div className="mt-4 flex items-center gap-3">
            <div className="text-sm">Attendees: {count}</div>
            {isRegistered ? (
              <Button onClick={unregister} disabled={saving}>{saving ? 'Saving…' : 'Cancel registration'}</Button>
            ) : (
              <Button onClick={register} disabled={saving}>{saving ? 'Saving…' : 'Register'}</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
