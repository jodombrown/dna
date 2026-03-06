/**
 * DNA | CONVENE — Post-RSVP DIA Nudge
 * After a user registers for an event, nudge them to share with connections.
 * Shows once per event per user, dismissible with standard DIA pattern.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isDismissed, dismissDIACard } from '@/services/diaCardService';
import { useToast } from '@/hooks/use-toast';

const ACCENT = '#C4942A';

interface PostRsvpDiaNudgeProps {
  eventId: string;
  eventTitle: string;
  eventCity: string | null;
  userId: string;
  visible: boolean;
}

export function PostRsvpDiaNudge({
  eventId,
  eventTitle,
  eventCity,
  userId,
  visible,
}: PostRsvpDiaNudgeProps) {
  const { toast } = useToast();
  const dismissKey = `convene-post-rsvp-${eventId}-${userId}`;
  const [show, setShow] = useState(false);
  const [alreadyDismissed] = useState(() => isDismissed(dismissKey));

  // Delay appearance for natural feel after RSVP success
  useEffect(() => {
    if (visible && !alreadyDismissed) {
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, [visible, alreadyDismissed]);

  if (alreadyDismissed || !show) return null;

  const handleDismiss = () => {
    dismissDIACard(dismissKey);
    setShow(false);
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: eventTitle, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link Copied', description: 'Event link copied to clipboard' });
    }
    handleDismiss();
  };

  const cityText = eventCity ? ` in ${eventCity}` : '';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative overflow-hidden rounded-xl border border-border/50 bg-card px-4 py-4"
          style={{
            borderLeftWidth: '3px',
            borderLeftColor: ACCENT,
            backgroundColor: `${ACCENT}08`,
          }}
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 p-3 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            aria-label="Dismiss"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <X className="w-4 h-4" />
          </button>

          {/* DIA module badge */}
          <div className="flex items-center gap-2 mb-2 pr-12">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full"
              style={{ backgroundColor: `${ACCENT}20` }}
            >
              <Sparkles className="w-3 h-3" style={{ color: ACCENT }} />
            </div>
            <span
              className="text-[10px] font-bold tracking-widest"
              style={{ color: ACCENT }}
            >
              DIA &bull; CONVENE
            </span>
          </div>

          {/* Content */}
          <div className="flex items-start gap-2 mb-1.5">
            <Share2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: ACCENT }} />
            <h4 className="font-semibold text-sm text-foreground leading-tight">
              Invite your connections{cityText} to join you!
            </h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed ml-6">
            Share this event with your network so they can attend too.
          </p>

          {/* CTA */}
          <div className="flex items-center mt-3 ml-6">
            <Button
              size="sm"
              className="text-xs rounded-full px-4 text-white"
              style={{ backgroundColor: ACCENT, minHeight: 44 }}
              onClick={handleShare}
            >
              Share Event
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
