import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import ComprehensiveLocationInput from '@/components/ui/comprehensive-location-input';

export default function OpportunityNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('general');
  const [location, setLocation] = useState('');
  const [impactArea, setImpactArea] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const t = title.trim(); if (!t) return;
    setSaving(true);
    // Ensure we set created_by to satisfy RLS and NOT NULL
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) {
      setSaving(false);
      alert('You must be signed in to create an opportunity.');
      return;
    }
    const { error } = await supabase.from('contribution_cards').insert({
      title: t,
      description: description.trim() || null,
      contribution_type: type,
      status: 'active',
      impact_area: impactArea.trim() || null,
      location: location.trim() || null,
      created_by: userId,
    });
    setSaving(false);
    if (!error) nav('/app/opportunities');
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader><CardTitle>Create opportunity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select value={type} onValueChange={v=>setType(v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="funding">Funding</SelectItem>
                <SelectItem value="mentorship">Mentorship</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="grant">Grant</SelectItem>
              </SelectContent>
            </Select>
            <ComprehensiveLocationInput
              id="opportunity-location"
              value={location}
              onChange={setLocation}
              placeholder="Location"
            />
          </div>
          <Input placeholder="Impact area (e.g., Health, Energy)" value={impactArea} onChange={e=>setImpactArea(e.target.value)} />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
            <Button variant="outline" onClick={()=>nav('/app/opportunities')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
