import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import CountrySelect from '@/components/ui/CountrySelect';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function CompleteFieldsModal({ missing, onClose }: { missing: string[]; onClose: () => void; }) {
  const { toast } = useToast();
  const [headline, setHeadline] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [countryName, setCountryName] = useState('');
  const [saving, setSaving] = useState(false);

  const needs = useMemo(() => new Set(missing || []), [missing]);

  const onSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Not authenticated');

      const updates: Record<string, any> = {};
      if (needs.has('headline')) updates.headline = headline || null;
      if (needs.has('current_city')) updates.current_city = currentCity || null;
      if (needs.has('current_country_code')) {
        updates.current_country_code = countryCode || null;
        updates.current_country_name = countryName || null;
        updates.current_country = countryName || null;
      }
      // Note: avatar upload not implemented here; wire to storage if required.

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;

      toast({ title: 'Profile updated', description: 'You can continue your action now.' });
      onClose();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Update failed', description: e.message || 'Please try again', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-2xl p-6 w-full max-w-lg space-y-5">
        <h3 className="text-lg font-semibold">Complete a few details to continue</h3>
        <div className="space-y-4">
          {needs.has('headline') && (
            <div>
              <Label htmlFor="headline">Professional Headline</Label>
              <Input id="headline" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="What do you do?" />
            </div>
          )}
          {needs.has('current_city') && (
            <div>
              <Label htmlFor="current_city">Current City</Label>
              <Input id="current_city" value={currentCity} onChange={(e) => setCurrentCity(e.target.value)} placeholder="City" />
            </div>
          )}
          {needs.has('current_country_code') && (
            <div>
              <Label>Current Country</Label>
              <CountrySelect value={countryCode} onChange={(code, name) => { setCountryCode(code); setCountryName(name); }} />
            </div>
          )}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}
