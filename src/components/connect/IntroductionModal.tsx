/**
 * DNA | Introduction Modal
 *
 * Bumble-card-inspired warm introduction workflow.
 * DNA logo, overlapping profile photos with pulsing Africa icon,
 * editable message (250 chars, auto-stretch), branded colors.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Check, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  sendGroupIntroduction,
  generateIntroMessage,
} from '@/services/introductionService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import dnaLogo from '@/assets/dna-logo.png';
import africaIcon from '@/assets/africa-icon.png';

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

const MAX_CHARS = 250;

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
      const generated = generateIntroMessage(
        profileA.full_name || 'there',
        profileB.full_name || 'there',
        profileA.headline || undefined,
        profileB.headline || undefined
      );
      setMessage(generated.slice(0, MAX_CHARS));
    }
  }, [profileA, profileB, message]);

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
    if (!message.trim() || message.length > MAX_CHARS) return;
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

  const isOverLimit = message.length > MAX_CHARS;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Card body with warm branded background */}
        <div className="bg-gradient-to-b from-primary/5 via-background to-background">

          {/* Top section: DNA Logo */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <img
              src={dnaLogo}
              alt="DNA"
              className="h-[50px] w-auto mb-3"
            />
          </div>

          {modalState === 'success' ? (
            /* Success State */
            <div className="flex flex-col items-center px-6 pb-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-1 font-display">
                Introduction Sent!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                {profileA?.full_name} and {profileB?.full_name} are now connected in a group thread.
              </p>

              {/* Overlapping avatars in success */}
              <div className="flex items-center justify-center mb-6">
                <Avatar className="w-16 h-16 border-[3px] border-background shadow-lg z-10">
                  <AvatarImage src={profileA?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials(profileA?.full_name ?? null)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-10 h-10 rounded-full bg-primary/10 border-[3px] border-background flex items-center justify-center -mx-3 z-20 shadow-md">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <Avatar className="w-16 h-16 border-[3px] border-background shadow-lg z-10">
                  <AvatarImage src={profileB?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials(profileB?.full_name ?? null)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex gap-2 w-full">
                {conversationId && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleOpenChange(false);
                      window.location.href = `/dna/messages?conversation=${conversationId}`;
                    }}
                  >
                    View Conversation
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenChange(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Compose State */
            <div className="px-6 pb-6">
              {/* Headline */}
              <h2 className="text-center text-xl font-bold text-foreground mb-5 font-display">
                Make an Introduction
              </h2>

              {/* Overlapping profile photos with pulsing Africa icon */}
              <div className="flex items-center justify-center mb-5">
                {/* Person A */}
                <div className="flex flex-col items-center z-10">
                  <Avatar className="w-20 h-20 border-[3px] border-background shadow-lg">
                    <AvatarImage src={profileA?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {initials(profileA?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Pulsing Africa continent icon (overlapping center) */}
                <div className="relative -mx-4 z-20">
                  <div className="w-11 h-11 rounded-full bg-background border-2 border-primary/20 flex items-center justify-center shadow-md animate-pulse">
                    <img
                      src={africaIcon}
                      alt="Africa"
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                </div>

                {/* Person B */}
                <div className="flex flex-col items-center z-10">
                  <Avatar className="w-20 h-20 border-[3px] border-background shadow-lg">
                    <AvatarImage src={profileB?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {initials(profileB?.full_name ?? null)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Names + details row */}
              <div className="flex items-start justify-between mb-5 gap-2">
                <div className="flex-1 text-center min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profileA?.full_name || 'Loading...'}
                  </p>
                  {profileA?.headline && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {profileA.headline}
                    </p>
                  )}
                  {profileA?.country_of_origin && (
                    <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{profileA.country_of_origin}</span>
                    </p>
                  )}
                </div>
                <div className="flex-1 text-center min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {profileB?.full_name || 'Loading...'}
                  </p>
                  {profileB?.headline && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {profileB.headline}
                    </p>
                  )}
                  {profileB?.country_of_origin && (
                    <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{profileB.country_of_origin}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Context reasons */}
              {context && Object.keys(context).length > 0 && (
                <ContextBlock context={context} />
              )}

              {/* Message composer */}
              <div className="mb-4">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  Your introduction message
                </label>
                <textarea
                  value={message}
                  onChange={e => {
                    setMessage(e.target.value);
                  }}
                  className={cn(
                    'w-full min-h-[80px] rounded-xl border-[1.5px] bg-background px-4 py-3 text-sm',
                    'placeholder:text-muted-foreground/50',
                    'focus:outline-none focus:border-primary focus:shadow-sm',
                    'transition-[border-color,box-shadow] duration-150',
                    'resize-y',
                    isOverLimit
                      ? 'border-destructive'
                      : 'border-border'
                  )}
                  placeholder="Write a warm introduction..."
                  style={{ fieldSizing: 'content' } as React.CSSProperties}
                />
                <p className={cn(
                  'text-[11px] text-right mt-1',
                  isOverLimit ? 'text-destructive font-semibold' : 'text-muted-foreground'
                )}>
                  {message.length}/{MAX_CHARS}
                </p>
              </div>

              {/* Send button */}
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold"
                disabled={!message.trim() || isOverLimit || modalState === 'sending'}
                onClick={handleSend}
              >
                {modalState === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Introduction'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* Context Block */
function ContextBlock({ context }: { context: Record<string, unknown> }) {
  const reasons = Object.entries(context)
    .filter(([, v]) => v)
    .map(([k, v]) => {
      if (k === 'sharedSkills' && Array.isArray(v))
        return `Shared skills: ${(v as string[]).join(', ')}`;
      if (k === 'sharedSectors' && Array.isArray(v))
        return `Same sectors: ${(v as string[]).join(', ')}`;
      return null;
    })
    .filter(Boolean);

  if (reasons.length === 0) return null;

  return (
    <div className="rounded-xl bg-muted/40 px-3 py-2.5 mb-4 border border-border/30">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Why connect them?
      </p>
      {reasons.map((reason, i) => (
        <p key={i} className="text-xs text-foreground">
          {reason}
        </p>
      ))}
    </div>
  );
}

export default IntroductionModal;
