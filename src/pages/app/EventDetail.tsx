import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EventDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ev, setEv] = useState<any>(null);
  const [count, setCount] = useState<number>(0);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [canViewAttendees, setCanViewAttendees] = useState<boolean>(false);
  const [uid, setUid] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    const evRes = await supabase.from('events').select('*').eq('id', id).maybeSingle();
    if (!evRes.error) setEv(evRes.data);
    const cRes = await supabase.rpc('rpc_event_attendee_count', { p_event: id });
    if (!cRes.error && typeof cRes.data === 'number') setCount(cRes.data);
const { data: auth } = await supabase.auth.getUser();
    const current = auth?.user?.id || null;
    setUid(current);
    if (current) {
      const myRes = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', current)
        .maybeSingle();
      setIsRegistered(Boolean(myRes.data));
    }
    // attempt to load attendees (owner/admin only)
    try {
      if (id) {
        const aRes = await supabase.rpc('rpc_event_attendees', { p_event: id });
        if (!aRes.error && Array.isArray(aRes.data)) {
          setAttendees(aRes.data);
          setCanViewAttendees(true);
        } else {
          setCanViewAttendees(false);
        }
      }
    } catch {
      setCanViewAttendees(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = ev?.title ? `${ev.title} | DNA` : 'Event | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', ev?.description || 'Event details on Diaspora Network of Africa');
    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', window.location.href.split('?')[0]);
    if (!link.parentNode) document.head.appendChild(link);
  }, [ev]);

  useEffect(() => { load(); }, [id]);

const register = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc('rpc_event_register', { p_event: id });
      if (error) throw error;
      toast.success('Registered');
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('capacity_reached')) toast.error('This event is full.');
      else toast.error('Could not register');
    } finally {
      setSaving(false);
      load();
    }
  };
const unregister = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc('rpc_event_unregister', { p_event: id });
      if (error) throw error;
      toast.success('Registration cancelled');
    } catch (err) {
      toast.error('Could not cancel');
    } finally {
      setSaving(false);
      load();
    }
  };
  
  const toICS = () => {
    if (!ev) return '';
    const uid = `${ev.id}@dna`;
    const dtStart = ev.date_time ? new Date(ev.date_time) : new Date();
    const dtStamp = new Date();
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DNA//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${fmt(dtStamp)}`,
      `DTSTART:${fmt(dtStart)}`,
      ev.title ? `SUMMARY:${ev.title.replace(/\r?\n/g, ' ')}` : 'SUMMARY:DNA Event',
      ev.location ? `LOCATION:${ev.location.replace(/\r?\n/g, ' ')}` : '',
      ev.description ? `DESCRIPTION:${ev.description.replace(/\r?\n/g, ' ')}` : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
    return lines;
  };

  const downloadICS = () => {
    const blob = new Blob([toICS()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = (ev?.title ? ev.title.replace(/[^a-z0-9]+/gi, '-') : 'dna-event') + '.ics';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied');
    } catch {}
  };

const isFull = ev?.max_attendees != null && count >= ev.max_attendees;
  if (loading) return <div className="p-4">Loading…</div>;
  if (!ev) return <div className="p-4">Event not found</div>;

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => nav('/app/events')}>Back to Events</Button>
        {uid && ev?.created_by === uid && (
          <Button onClick={() => nav(`/app/events/${ev.id}/edit`)}>Edit</Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{ev.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">{ev.date_time ? new Date(ev.date_time).toLocaleString() : ''}</div>
          {ev.location && <div className="text-sm">{ev.location}</div>}
          {ev.type && <div className="text-sm">Type: {ev.type}</div>}
          {ev.description && <article className="mt-2 whitespace-pre-wrap">{ev.description}</article>}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="text-sm">Attendees: {count}{ev?.max_attendees != null ? ` / ${ev.max_attendees}` : ''}</div>
            {isRegistered ? (
              <Button onClick={unregister} disabled={saving}>{saving ? 'Saving…' : 'Cancel registration'}</Button>
            ) : isFull ? (
              <Button disabled>Event full</Button>
            ) : (
              <Button onClick={register} disabled={saving}>{saving ? 'Saving…' : 'Register'}</Button>
            )}
            <Button variant="outline" onClick={downloadICS}>Add to calendar</Button>
            <Button variant="outline" onClick={copyShareLink}>Share link</Button>
          </div>

          {canViewAttendees && (
            <div className="mt-6">
              <div className="font-medium mb-2">Attendees</div>
              {attendees.length === 0 ? (
                <div className="text-sm text-muted-foreground">No registrations yet.</div>
              ) : (
                <ul className="space-y-1">
                  {attendees.map((a) => (
                    <li key={a.user_id} className="text-sm">
                      {a.full_name || a.username || a.user_id}
                      <span className="text-muted-foreground ml-2">• {a.registered_at ? new Date(a.registered_at).toLocaleString() : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
