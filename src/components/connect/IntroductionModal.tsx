/**
 * DNA | Introduction Modal
 *
 * A guided warm introduction workflow. Shows both profiles,
 * DIA context, editable message, and sends a group introduction.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, ArrowRight, Loader2, Check, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  sendGroupIntroduction,
  generateIntroMessage,
} from '@/services/introductionService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface ProfileData {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  username: string | null;
  country_of_origin: string | null;
}

interface IntroductionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personAId: string;
  personBId: string;
  introducerId: string;
  context?: Record<string, unknown>;
}

type ModalState = 'compose' | 'sending' | 'success';

export function IntroductionModal({
  open,
  onOpenChange,
  personAId,
  personBId,
  introducerId,
  context,
}: IntroductionModalProps) {
  const { toast } = useToast();
  const [profileA, setProfileA] = useState<ProfileData | null>(null);
  const [profileB, setProfileB] = useState<ProfileData | null>(null);
  const [message, setMessage] = useState('');
  const [modalState, setModalState] = useState<ModalState>('compose');
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Fetch profiles
  useEffect(() => {
    if (!open) return;

    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, headline, username, country_of_origin')
        .in('id', [personAId, personBId]);

      if (data) {
        setProfileA(data.find(p => p.id === personAId) || null);
        setProfileB(data.find(p => p.id === personBId) || null);
      }
    };

    fetchProfiles();
  }, [open, personAId, personBId]);

  // Generate default message when profiles load
  useEffect(() => {
    if (profileA && profileB && !message) {
      setMessage(
        generateIntroMessage(
          profileA.full_name || 'there',
          profileB.full_name || 'there',
          profileA.headline || undefined,
          profileB.headline || undefined
        )
      );
    }
  }, [profileA, profileB, message]);

  // Reset state when closing
  const handleOpenChange = useCallback(
    (val: boolean) => {
      if (!val) {
        setTimeout(() => {
          setModalState('compose');
          setMessage('');
          setConversationId(null);
        }, 300);
      }
      onOpenChange(val);
    },
    [onOpenChange]
  );

  const handleSend = async () => {
    if (!message.trim()) return;
    setModalState('sending');

    const result = await sendGroupIntroduction({
      introducerId,
      personAId,
      personBId,
      message: message.trim(),
      introType: 'group',
      context,
    });

    if (result.success) {
      setConversationId(result.conversationId || null);
      setModalState('success');

      // Fire confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#4A8D77', '#C4942A', '#2A7A8C'],
      });
    } else {
      setModalState('compose');
      toast({
        title: 'Introduction failed',
        description: result.error || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const initials = (name: string | null) =>
    name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
      : '?';

  const contextReasons = context
    ? Object.entries(context)
        .filter(([, v]) => v)
        .map(([k, v]) => {
          if (k === 'sharedSkills' && Array.isArray(v))
            return `Shared skills: ${(v as string[]).join(', ')}`;
          if (k === 'sharedSectors' && Array.isArray(v))
            return `Same sectors: ${(v as string[]).join(', ')}`;
          return null;
        })
        .filter(Boolean)
    : [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        {/* Gradient top bar */}
        <div
          className="h-1"
          style={{
            background:
              'linear-gradient(90deg, #C4942A 0%, #4A8D77 50%, #2A7A8C 100%)',
          }}
        />

        {modalState === 'success' ? (
          /* ─── Success State ─────────────────────── */
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Check className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Introduction sent!</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {profileA?.full_name} and {profileB?.full_name} have been connected
              in a group thread.
            </p>
            <div className="flex gap-2">
              {conversationId && (
                <Button
                  size="sm"
                  onClick={() => {
                    handleOpenChange(false);
                    window.location.href = `/dna/messages?conversation=${conversationId}`;
                  }}
                >
                  View Conversation
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* ─── Compose State ─────────────────────── */
          <div className="px-5 py-5">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-base">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-dna-gold to-primary flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                Make an Introduction
              </DialogTitle>
            </DialogHeader>

            {/* Profile Cards */}
            <div className="flex items-center gap-3 mb-4">
              <ProfileMiniCard profile={profileA} initials={initials} />
              <div className="flex-shrink-0">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
              <ProfileMiniCard profile={profileB} initials={initials} />
            </div>

            {/* Context */}
            {contextReasons.length > 0 && (
              <div className="rounded-lg bg-muted/50 px-3 py-2.5 mb-4 border border-border/30">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  Why connect them?
                </p>
                {contextReasons.map((reason, i) => (
                  <p key={i} className="text-xs text-foreground">
                    {reason}
                  </p>
                ))}
              </div>
            )}

            {/* Message */}
            <div className="mb-4">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                Your introduction message
              </label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                className="text-sm resize-none"
                placeholder="Write a warm introduction..."
              />
            </div>

            {/* Send */}
            <Button
              className="w-full"
              disabled={!message.trim() || modalState === 'sending'}
              onClick={handleSend}
            >
              {modalState === 'sending' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send Introduction'
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ─── Profile Mini Card ──────────────────────────── */

function ProfileMiniCard({
  profile,
  initials,
}: {
  profile: ProfileData | null;
  initials: (name: string | null) => string;
}) {
  if (!profile) {
    return (
      <div className="flex-1 rounded-lg border border-border/50 bg-muted/30 p-3 animate-pulse h-20" />
    );
  }

  return (
    <div className="flex-1 rounded-lg border border-border/50 bg-card p-3 text-center">
      <Avatar className="w-10 h-10 mx-auto mb-1.5">
        <AvatarImage src={profile.avatar_url || undefined} />
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {initials(profile.full_name)}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs font-semibold truncate">
        {profile.full_name || 'Unknown'}
      </p>
      {profile.headline && (
        <p className="text-[10px] text-muted-foreground truncate mt-0.5">
          {profile.headline}
        </p>
      )}
      {profile.country_of_origin && (
        <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
          <MapPin className="w-2.5 h-2.5" />
          {profile.country_of_origin}
        </p>
      )}
    </div>
  );
}

export default IntroductionModal;
