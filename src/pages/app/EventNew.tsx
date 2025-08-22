import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function EventNew() {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('meetup');
const [saving, setSaving] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('');
  const [registrationUrl, setRegistrationUrl] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

const save = async () => {
    const t = title.trim();
    if (!t) return;
    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) throw new Error('Authentication required');

      const id = crypto.randomUUID();

      let banner_url: string | null = null;
      let image_url: string | null = null;

      if (bannerFile) {
        const ext = (bannerFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${uid}/${id}/banner.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('event-media')
          .upload(path, bannerFile, { upsert: true, contentType: bannerFile.type });
        if (upErr) throw upErr;
        banner_url = supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl;
      }

      if (imageFile) {
        const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
        const path = `${uid}/${id}/image.${ext}`;
        const { error: upErr2 } = await supabase.storage
          .from('event-media')
          .upload(path, imageFile, { upsert: true, contentType: imageFile.type });
        if (upErr2) throw upErr2;
        image_url = supabase.storage.from('event-media').getPublicUrl(path).data.publicUrl;
      }

      const payload: any = {
        id,
        title: t,
        description: description.trim() || null,
        date_time: dateTime ? new Date(dateTime).toISOString() : null,
        location: isVirtual ? null : (location.trim() || null),
        is_virtual: isVirtual,
        type: type || null,
        max_attendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
        registration_url: registrationUrl.trim() || null,
        banner_url,
        image_url,
        created_by: uid,
      };

      const { error } = await supabase.from('events').insert(payload);
      if (error) throw error;

      toast.success('Event created');
      nav(`/app/events/${id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card>
        <CardHeader><CardTitle>Create event</CardTitle></CardHeader>
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
              <Input placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)} />
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
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
            <Button variant="outline" onClick={()=>nav('/app/events')}>Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
