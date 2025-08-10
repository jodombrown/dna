import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Scanner from '@/components/events/checkin/Scanner';
import { supabase } from '@/integrations/supabase/client';

const EventCheckIn: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [canManage, setCanManage] = useState(false);
  const [title, setTitle] = useState('');
  const [totalCheckins, setTotalCheckins] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { navigate('/auth'); return; }
      const { data } = await supabase.from('events').select('id, title, created_by').eq('id', id).maybeSingle();
      if (!data) { navigate('/app/events'); return; }
      setTitle(data.title || 'Event');
      const ok = data.created_by === auth.user.id;
      setCanManage(ok);
      if (!ok) { navigate(`/app/events/${id}`); return; }
      // load check-in count (two-step without FK join)
      const { data: regs } = await supabase.from('event_registrations').select('id').eq('event_id', id);
      const regIds = (regs || []).map(r => r.id);
      if (regIds.length === 0) { setTotalCheckins(0); return; }
      const { data: chks } = await supabase.from('event_checkins').select('id').in('registration_id', regIds);
      setTotalCheckins((chks || []).length);
    };
    load();
  }, [id, navigate]);

  const onCheckIn = () => {
    // refresh simple stat
    (async () => {
      if (!id) return;
      // refresh via two-step query
      const { data: regs } = await supabase.from('event_registrations').select('id').eq('event_id', id);
      const regIds = (regs || []).map(r => r.id);
      if (regIds.length === 0) { setTotalCheckins(0); return; }
      const { data: chks } = await supabase.from('event_checkins').select('id').in('registration_id', regIds);
      setTotalCheckins((chks || []).length);
    })();
  };

  if (!canManage) return null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => navigate(`/app/events/${id}/manage`)}>Back</Button>
        <h1 className="text-2xl font-bold">Check-In: {title}</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Scan attendee QR</CardTitle>
          </CardHeader>
          <CardContent>
            {id && <Scanner eventId={id} onCheckIn={onCheckIn as any} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">Total check-ins</div>
            <div className="text-3xl font-bold">{totalCheckins}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EventCheckIn;
