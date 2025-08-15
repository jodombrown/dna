import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ComprehensiveLocationInput from '@/components/ui/comprehensive-location-input';

export default function EventEdit() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('meetup');
  const [isVirtual, setIsVirtual] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      setUid(auth?.user?.id || null);
      const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
      if (error || !data) {
        toast.error('Event not found');
        nav('/app/events');
        return;
      }
      setTitle(data.title || '');
      setDescription(data.description || '');
      setDateTime(data.date_time ? new Date(data.date_time).toISOString().slice(0,16) : '');
      setLocation(data.location || '');
      setType(data.type || 'meetup');
      setIsVirtual(!!data.is_virtual);
      setMaxAttendees(data.max_attendees?.toString() || '');
      setRegistrationUrl(data.registration_url || '');
      setLoading(false);
    };
    load();
  }, [id, nav]);

  const save = async () => {
    if (!id) return;
    const t = title.trim(); if (!t) return;
    setSaving(true);
    try {
      const payload: any = {
        title: t,
        description: description.trim() || null,
        date_time: dateTime ? new Date(dateTime).toISOString() : null,
        location: isVirtual ? null : (location.trim() || null),
        is_virtual: isVirtual,
        type: type || null,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        registration_url: registrationUrl.trim() || null,
      };

      // Optional re-uploads
      if (uid && bannerFile) {
        const ext = (bannerFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${uid}/${id}/banner.${ext}`;
        const { error: upErr } = await supabase.storage.from('event-media').upload(path, bannerFile, { upsert: true, contentType: bannerFile.type });
        if (upErr) throw upErr;
        payload.banner_url = supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl;
      }
      if (uid && imageFile) {
        const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${uid}/${id}/image.${ext}`;
        const { error: upErr2 } = await supabase.storage.from('event-media').upload(path, imageFile, { upsert: true, contentType: imageFile.type });
        if (upErr2) throw upErr2;
        payload.image_url = supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('events').update(payload).eq('id', id);
      if (error) throw error;
      toast.success('Event updated');
      nav(`/app/events/${id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader><CardTitle>Edit event</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
          <Textarea placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input type="datetime-local" value={dateTime} onChange={e=>setDateTime(e.target.value)} />
            <Input placeholder="Type (e.g., meetup, webinar)" value={type} onChange={e=>setType(e.target.value)} />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isVirtual} onChange={e=>setIsVirtual(e.target.checked)} />
              Virtual event
            </label>
            {!isVirtual && (
              <ComprehensiveLocationInput
                id="event-location"
                value={location}
                onChange={setLocation}
                placeholder="Event location"
              />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input type="number" min={0} placeholder="Max attendees (optional)" value={maxAttendees} onChange={e=>setMaxAttendees(e.target.value)} />
            <Input placeholder="Registration URL (optional)" value={registrationUrl} onChange={e=>setRegistrationUrl(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm">Banner image</label>
              <Input type="file" accept="image/*" onChange={e=>setBannerFile(e.target.files?.[0] || null)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Card image</label>
              <Input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button variant="outline" onClick={()=>nav(`/app/events/${id}`)}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
