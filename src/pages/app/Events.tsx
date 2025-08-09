import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Events() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date_time', { ascending: true });
    if (!error) setItems(data || []);
    setLoading(false);
  };

  useEffect(() => {
    document.title = 'Events | DNA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Discover upcoming DNA community events and meetups.');
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Events</h1>
        <Button onClick={() => navigate('/app/events/new')}>Create event</Button>
      </div>
      {loading ? (
        <div>Loading…</div>
      ) : items.length === 0 ? (
        <Card><CardContent className="p-4 text-sm text-muted-foreground">No events yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.map((ev) => (
            <Card key={ev.id}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{ev.title}</span>
                  <span className="text-xs text-muted-foreground">{ev.date_time ? new Date(ev.date_time).toLocaleString() : ''}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">{ev.description}</div>
                <div className="text-xs text-muted-foreground mt-1">{ev.location}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
