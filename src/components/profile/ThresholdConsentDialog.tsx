import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { getRoleLabel } from '@/components/onboarding/RoleDeclarationStep';
import { getErrorMessage } from '@/lib/errorLogger';

/**
 * The only values profiles.threshold_fields accepts. A CHECK constraint
 * rejects anything else with 23514, so never send a value off this list.
 */
export type ThresholdField = 'name' | 'avatar' | 'headline' | 'role' | 'place';

const ALLOWED_FIELDS: ThresholdField[] = ['name', 'avatar', 'headline', 'role', 'place'];

const FIELD_LABELS: Record<ThresholdField, string> = {
  name: 'Name',
  avatar: 'Photo',
  headline: 'Headline',
  role: 'Role',
  place: 'Place',
};

type PresetId = 'handle' | 'name_face' | 'name_face_role_place' | 'custom';

const PRESETS: Array<{ id: Exclude<PresetId, 'custom'>; label: string; fields: ThresholdField[] }> = [
  { id: 'handle', label: 'Just my handle', fields: [] },
  { id: 'name_face', label: 'Name and face', fields: ['name', 'avatar'] },
  {
    id: 'name_face_role_place',
    label: 'Name, face, role and place',
    fields: ['name', 'avatar', 'role', 'place'],
  },
];

export interface ThresholdConsentProfile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  role?: string | null;
  current_country?: string | null;
  threshold_fields?: string[] | null;
}

interface ThresholdConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ThresholdConsentProfile | null | undefined;
  onSaved?: (fields: ThresholdField[]) => void;
  /** Read only mode shows the current consent set without letting it change. */
  readOnly?: boolean;
}

function sameSet(a: ThresholdField[], b: ThresholdField[]): boolean {
  return a.length === b.length && a.every((f) => b.includes(f));
}

function sanitize(fields: string[] | null | undefined): ThresholdField[] {
  return ALLOWED_FIELDS.filter((f) => (fields ?? []).includes(f));
}

function presetFor(fields: ThresholdField[]): PresetId {
  const match = PRESETS.find((p) => sameSet(p.fields, fields));
  return match ? match.id : 'custom';
}

export const ThresholdConsentDialog: React.FC<ThresholdConsentDialogProps> = ({
  open,
  onOpenChange,
  profile,
  onSaved,
  readOnly = false,
}) => {
  const { toast } = useToast();
  const [fields, setFields] = useState<ThresholdField[]>([]);
  const [preset, setPreset] = useState<PresetId>('handle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const current = sanitize(profile?.threshold_fields);
    setFields(current);
    setPreset(presetFor(current));
  }, [open, profile]);

  const has = (f: ThresholdField) => fields.includes(f);

  const handlePresetChange = (value: string) => {
    const next = value as PresetId;
    setPreset(next);
    if (next !== 'custom') {
      const found = PRESETS.find((p) => p.id === next);
      setFields(found ? [...found.fields] : []);
    }
  };

  const toggleField = (field: ThresholdField, checked: boolean) => {
    setFields((prev) => {
      const next = checked ? [...prev, field] : prev.filter((f) => f !== field);
      return ALLOWED_FIELDS.filter((f) => next.includes(f));
    });
  };

  const handleSave = async () => {
    if (!profile?.id) return;
    const payload = sanitize(fields);
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ threshold_fields: payload })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Saved',
        description: 'We updated what a signed-out visitor sees.',
      });
      onSaved?.(payload);
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: 'Could not save',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const roleLabel =
    has('role') && profile?.role && profile.role !== 'exploring' ? getRoleLabel(profile.role) : null;
  const displayName = profile?.full_name || profile?.display_name || null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-sheet overflow-y-auto">
        <DialogHeader>
          <DialogTitle>What should someone see if they land on your link?</DialogTitle>
          <DialogDescription>
            Your profile is hidden from the open internet. DNA Members can still find you and see
            everything. This is only about what a signed-out visitor sees.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={preset}
          onValueChange={handlePresetChange}
          className="space-y-2"
          disabled={readOnly}
        >
          {PRESETS.map((p) => (
            <Label
              key={p.id}
              htmlFor={`threshold-preset-${p.id}`}
              className={`flex items-center gap-3 rounded-lg border p-3 ${
                readOnly ? 'cursor-default' : 'cursor-pointer'
              } ${preset === p.id ? 'border-primary bg-muted' : 'border-border'}`}
            >
              <RadioGroupItem value={p.id} id={`threshold-preset-${p.id}`} />
              <span className="font-normal">{p.label}</span>
            </Label>
          ))}
          <Label
            htmlFor="threshold-preset-custom"
            className={`flex items-center gap-3 rounded-lg border p-3 ${
              readOnly ? 'cursor-default' : 'cursor-pointer'
            } ${preset === 'custom' ? 'border-primary bg-muted' : 'border-border'}`}
          >
            <RadioGroupItem value="custom" id="threshold-preset-custom" />
            <span className="font-normal">Choose exactly</span>
          </Label>
        </RadioGroup>

        {preset === 'custom' && (
          <div className="space-y-2 rounded-lg border p-3">
            {ALLOWED_FIELDS.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <Checkbox
                  id={`threshold-field-${f}`}
                  checked={has(f)}
                  onCheckedChange={(checked) => toggleField(f, checked === true)}
                  disabled={readOnly}
                />
                <Label htmlFor={`threshold-field-${f}`} className="font-normal">
                  {FIELD_LABELS[f]}
                </Label>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-body font-medium">What a visitor sees</p>
          <div className="flex items-center gap-3">
            {has('avatar') && profile?.avatar_url && (
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url} alt="" />
                <AvatarFallback>
                  {(displayName || profile?.username || '?').charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              {has('name') && displayName && <p className="font-medium">{displayName}</p>}
              {profile?.username && (
                <p className="text-body text-muted-foreground">@{profile.username}</p>
              )}
            </div>
          </div>
          {has('headline') && profile?.headline && <p className="text-body">{profile.headline}</p>}
          {roleLabel && <p className="text-body text-muted-foreground">{roleLabel}</p>}
          {has('place') && profile?.current_country && (
            <p className="text-body text-muted-foreground">{profile.current_country}</p>
          )}
          <p className="text-body">Member of DNA</p>
          <p className="text-body text-muted-foreground">This Member is visible to Members.</p>
        </div>

        <DialogFooter>
          {readOnly ? (
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
                Not now
              </Button>
              <Button onClick={handleSave} disabled={saving || !profile?.id}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThresholdConsentDialog;
