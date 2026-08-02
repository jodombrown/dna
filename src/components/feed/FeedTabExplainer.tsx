/**
 * Feed Tab Explainer Component
 * 
 * Shows an animated explainer message for each feed tab.
 * - Appears only on first click of the day per tab
 * - Slides down smoothly on entry
 * - Stays for 10 seconds
 * - Slides out to the right at a slightly faster pace
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FeedTab } from '@/types/feed';
import { useAuth } from '@/contexts/AuthContext';
import { FEED_LENSES } from '@/components/feed/MobileFeedTabs';

interface FeedTabExplainerProps {
  activeTab: FeedTab;
}

/**
 * The lens definition (FEED_LENSES) is the single source of truth for each
 * tab's id, label and icon. The explainer reads title (= lens label) and glyph
 * (= lens icon) from it, so My Network's UserCheck glyph can never diverge from
 * the explainer. See BD332c.
 */
const LENS = Object.fromEntries(FEED_LENSES.map((l) => [l.id, l])) as Record<
  FeedTab,
  (typeof FEED_LENSES)[number]
>;

/**
 * What is genuinely the explainer's own: the longer body copy (distinct from
 * the lens's short accessible-name description) and the visual treatment. Keyed
 * by the lens id — the dismissal storage key derives from the same id below.
 */
const EXPLAINER: Record<FeedTab, { description: string; bgClass: string }> = {
  all: {
    description: 'Discover the latest updates, stories, and conversations from across the diaspora community',
    bgClass: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20',
  },
  for_you: {
    description: 'These posts are selected based on your connections, interests, and engagement patterns',
    bgClass: 'bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 border-dna-copper/20',
  },
  network: {
    description: 'Posts from your connections and people in your extended diaspora network',
    bgClass: 'bg-gradient-to-r from-dna-emerald/10 to-dna-emerald/5 border-dna-emerald/20',
  },
  my_posts: {
    description: 'All the posts and stories you\'ve shared with the diaspora community',
    bgClass: 'bg-gradient-to-r from-dna-terracotta/10 to-dna-terracotta/5 border-dna-terracotta/20',
  },
  bookmarks: {
    description: 'Posts you\'ve bookmarked to read later or reference again',
    bgClass: 'bg-gradient-to-r from-dna-ochre/10 to-dna-ochre/5 border-dna-ochre/20',
  },
};

const getStorageKey = (tab: FeedTab, userId: string) => `dna_feed_explainer_${tab}_${userId}`;

const hasShownThisSession = (tab: FeedTab, userId: string, sessionTimestamp: number): boolean => {
  try {
    const stored = localStorage.getItem(getStorageKey(tab, userId));
    if (!stored) return false;
    
    const data = JSON.parse(stored);
    const today = new Date().toDateString();
    
    // Reset if different day
    if (data.date !== today) return false;
    
    // Reset if new login session
    if (sessionTimestamp > data.sessionTimestamp) return false;
    
    return true;
  } catch {
    return false;
  }
};

const markAsShown = (tab: FeedTab, userId: string, sessionTimestamp: number): void => {
  try {
    const today = new Date().toDateString();
    localStorage.setItem(getStorageKey(tab, userId), JSON.stringify({
      date: today,
      sessionTimestamp,
      shownAt: Date.now()
    }));
  } catch {}
};

export const FeedTabExplainer: React.FC<FeedTabExplainerProps> = ({ activeTab }) => {
  const { user, session } = useAuth();
  const [visibleTab, setVisibleTab] = useState<FeedTab | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  // Get session timestamp for login detection
  const sessionTimestamp = session?.access_token 
    ? new Date(session.expires_at ? (session.expires_at * 1000 - 3600000) : Date.now()).getTime()
    : Date.now();

  useEffect(() => {
    if (!user) return;

    // Check if we should show the explainer for this tab
    if (!hasShownThisSession(activeTab, user.id, sessionTimestamp)) {
      markAsShown(activeTab, user.id, sessionTimestamp);
      setIsExiting(false);
      setVisibleTab(activeTab);
      
      // Start exit animation after 10 seconds
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 10000);
      
      // Hide completely after exit animation (300ms after starting exit)
      const hideTimer = setTimeout(() => {
        setVisibleTab(null);
      }, 10300);
      
      return () => {
        clearTimeout(exitTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [activeTab, user, sessionTimestamp]);

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
