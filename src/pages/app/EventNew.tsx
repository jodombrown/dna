import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function EventNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('meetup');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const t = title.trim(); if (!t) return;
    setSaving(true);
    const payload: any = {
      title: t,
      description: description.trim() || null,
      date_time: dateTime ? new Date(dateTime).toISOString() : null,
      location: location.trim() || null,
      type: type || null,
    };
    const { error } = await supabase.from('events').insert(payload);
    setSaving(false);
    if (!error) nav('/app/events');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader><CardTitle>Create event</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input type="datetime-local" value={dateTime} onChange={e=>setDateTime(e.target.value)} />
            <Input placeholder="Type (e.g., meetup, webinar)" value={type} onChange={e=>setType(e.target.value)} />
          </div>
          <Input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
            <Button variant="outline" onClick={()=>nav('/app/events')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
