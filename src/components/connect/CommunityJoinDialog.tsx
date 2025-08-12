import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CommunityJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  community: { id: string; name: string; category?: string | null } | null;
  isLoggedIn: boolean;
  onProceed: (payload: { reason: string; note?: string }) => void;
  onOpenLogin: () => void;
}

const REASONS = [
  { value: 'join_member', label: 'Join as Member' },
  { value: 'follow_updates', label: 'Follow Updates' },
  { value: 'collaborate', label: 'Collaborate on Projects' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sponsorship', label: 'Sponsorship' },
  { value: 'mentor_volunteer', label: 'Mentor / Volunteer' },
  { value: 'host_event', label: 'Host an Event' },
  { value: 'dm_admins', label: 'DM Admins' },
];

const CommunityJoinDialog: React.FC<CommunityJoinDialogProps> = ({
  open,
  onOpenChange,
  community,
  isLoggedIn,
  onProceed,
  onOpenLogin,
}) => {
  const [reason, setReason] = useState<string>('join_member');
  const [note, setNote] = useState<string>('');

  if (!community) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    onProceed({ reason, note: note.trim() || undefined });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Join {community.name}</DialogTitle>
          <DialogDescription>
            Choose your reason for connecting. This helps the community welcome you appropriately.
          </DialogDescription>
        </DialogHeader>

        {!isLoggedIn && (
          <div className="rounded-md border border-dna-emerald/30 bg-dna-emerald/5 p-3 text-sm">
            You need to sign in to continue.
            <div className="mt-2">
              <Button size="sm" className="bg-dna-emerald hover:bg-dna-forest text-white" onClick={onOpenLogin}>
                Sign in to continue
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <Label className="mb-2 block">Reason</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center space-x-2 rounded-md border p-2">
                  <RadioGroupItem id={`reason-${r.value}`} value={r.value} />
                  <Label htmlFor={`reason-${r.value}`}>{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </section>

          <section>
            <Label htmlFor="note" className="mb-2 block">Optional note</Label>
            <Textarea
              id="note"
              placeholder="Add context (interests, goals, how you’d like to contribute)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isLoggedIn}
              className="bg-dna-emerald hover:bg-dna-forest text-white"
            >
              Join
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommunityJoinDialog;
