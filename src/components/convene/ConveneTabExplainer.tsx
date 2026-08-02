/**
 * Convene Tab Explainer Component
 * 
 * Shows an animated explainer message for each convene tab.
 * - Appears only on first click of the day per tab
 * - Slides down smoothly on entry
 * - Stays for 10 seconds
 * - Slides out to the right at a slightly faster pace
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { CONVENE_LENSES } from '@/components/convene/ConveneShell';

export type ConveneTab = 'all' | 'near_me' | 'this_week' | 'online' | 'free' | 'network';

interface ConveneTabExplainerProps {
  activeTab: string;
}

/**
 * The lens definition (CONVENE_LENSES) is the single source of truth for each
 * tab's id, label and icon. The explainer reads title (= lens label) and glyph
 * (= lens icon) from it, so the Virtual lens's Video glyph can never diverge
 * from the explainer. See BD332c.
 */
const LENS = Object.fromEntries(CONVENE_LENSES.map((l) => [l.id, l])) as Record<
  ConveneTab,
  (typeof CONVENE_LENSES)[number]
>;

/**
 * What is genuinely the explainer's own: the longer body copy and the visual
 * treatment. Keyed by the lens id — the dismissal storage key derives from the
 * same id below.
 */
const EXPLAINER: Record<ConveneTab, { description: string; bgClass: string }> = {
  all: {
    description: 'Browse every upcoming event across the diaspora community',
    bgClass: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20',
  },
  near_me: {
    description: 'Events happening close to your current location',
    bgClass: 'bg-gradient-to-r from-dna-emerald/10 to-dna-emerald/5 border-dna-emerald/20',
  },
  this_week: {
    description: 'Events taking place within the next seven days',
    bgClass: 'bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 border-dna-copper/20',
  },
  online: {
    description: 'Virtual events you can join from anywhere in the world',
    bgClass: 'bg-gradient-to-r from-dna-terracotta/10 to-dna-terracotta/5 border-dna-terracotta/20',
  },
  free: {
    description: 'No-cost events open to all community members',
    bgClass: 'bg-gradient-to-r from-dna-ochre/10 to-dna-ochre/5 border-dna-ochre/20',
  },
  network: {
    description: 'Events hosted by or attended by people in your network',
    bgClass: 'bg-gradient-to-r from-dna-emerald/10 to-dna-emerald/5 border-dna-emerald/20',
  },
};

const VALID_TABS: ConveneTab[] = ['all', 'near_me', 'this_week', 'online', 'free', 'network'];

const getStorageKey = (tab: ConveneTab, userId: string) => `dna_convene_explainer_${tab}_${userId}`;

const hasShownThisSession = (tab: ConveneTab, userId: string, sessionTimestamp: number): boolean => {
  try {
    const stored = localStorage.getItem(getStorageKey(tab, userId));
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    
    if (data.date !== today) return false;
    if (sessionTimestamp > data.sessionTimestamp) return false;
    
    return true;
  } catch {
    return false;
  }
};

const markAsShown = (tab: ConveneTab, userId: string, sessionTimestamp: number): void => {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(getStorageKey(tab, userId), JSON.stringify({
      date: today,
      sessionTimestamp,
      shownAt: Date.now()
    }));
  } catch {}
};

export const ConveneTabExplainer: React.FC<ConveneTabExplainerProps> = ({ activeTab }) => {
  const { user, session } = useAuth();
  const [visibleTab, setVisibleTab] = useState<ConveneTab | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const sessionTimestamp = session?.access_token 
    ? new Date(session.expires_at ? (session.expires_at * 1000 - 3600000) : Date.now()).getTime()
    : Date.now();

  const typedTab = VALID_TABS.includes(activeTab as ConveneTab) ? (activeTab as ConveneTab) : null;

  useEffect(() => {
    if (!user || !typedTab) return;

    if (!hasShownThisSession(typedTab, user.id, sessionTimestamp)) {
      markAsShown(typedTab, user.id, sessionTimestamp);
      setIsExiting(false);
      setVisibleTab(typedTab);
      
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 10000);
      
      const hideTimer = setTimeout(() => {
        setVisibleTab(null);
      }, 10300);
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [typedTab, user, sessionTimestamp]);

  const lens = visibleTab ? LENS[visibleTab] : null;
  const copy = visibleTab ? EXPLAINER[visibleTab] : null;

  if (!lens || !copy || !visibleTab) return null;

  const Icon = lens.icon;

  return (
    <AnimatePresence mode="wait">
      {visibleTab && (
        <motion.div
          key={visibleTab}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={isExiting 
            ? { opacity: 0, x: 100, height: 0, marginBottom: 0 }
            : { opacity: 1, y: 0, height: 'auto', marginBottom: 4 }
          }
          exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0 }}
          transition={isExiting 
            ? { duration: 0.25, ease: 'easeIn' }
            : { duration: 0.4, ease: 'easeOut' }
          }
          className="overflow-hidden"
        >
          <div className={`p-3 rounded-lg border ${copy.bgClass}`}>
            <div className="flex items-start gap-2">
              <Icon className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs">{lens.label}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  {copy.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
