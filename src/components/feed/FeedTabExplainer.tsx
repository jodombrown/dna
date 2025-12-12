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
import { Newspaper, Sparkles, Users, PenSquare, Bookmark } from 'lucide-react';
import { FeedTab } from '@/types/feed';

interface FeedTabExplainerProps {
  activeTab: FeedTab;
}

const TAB_EXPLAINERS: Record<FeedTab, { title: string; description: string; icon: React.ElementType; bgClass: string }> = {
  all: {
    title: 'All Posts',
    description: 'Discover the latest updates, stories, and conversations from across the diaspora community',
    icon: Newspaper,
    bgClass: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20',
  },
  for_you: {
    title: 'Personalized For You',
    description: 'These posts are selected based on your connections, interests, and engagement patterns',
    icon: Sparkles,
    bgClass: 'bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 border-dna-copper/20',
  },
  network: {
    title: 'My Network',
    description: 'Posts from your connections and people in your extended diaspora network',
    icon: Users,
    bgClass: 'bg-gradient-to-r from-dna-emerald/10 to-dna-emerald/5 border-dna-emerald/20',
  },
  my_posts: {
    title: 'Your Posts',
    description: 'All the posts and stories you\'ve shared with the diaspora community',
    icon: PenSquare,
    bgClass: 'bg-gradient-to-r from-dna-terracotta/10 to-dna-terracotta/5 border-dna-terracotta/20',
  },
  bookmarks: {
    title: 'Saved Posts',
    description: 'Posts you\'ve bookmarked to read later or reference again',
    icon: Bookmark,
    bgClass: 'bg-gradient-to-r from-dna-ochre/10 to-dna-ochre/5 border-dna-ochre/20',
  },
};

const getStorageKey = (tab: FeedTab) => `dna_feed_explainer_${tab}`;

const hasShownToday = (tab: FeedTab): boolean => {
  const stored = localStorage.getItem(getStorageKey(tab));
  if (!stored) return false;
  
  const today = new Date().toDateString();
  return stored === today;
};

const markAsShown = (tab: FeedTab): void => {
  const today = new Date().toDateString();
  localStorage.setItem(getStorageKey(tab), today);
};

export const FeedTabExplainer: React.FC<FeedTabExplainerProps> = ({ activeTab }) => {
  const [visibleTab, setVisibleTab] = useState<FeedTab | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Check if we should show the explainer for this tab
    if (!hasShownToday(activeTab)) {
      markAsShown(activeTab);
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
  }, [activeTab]);

  const explainer = visibleTab ? TAB_EXPLAINERS[visibleTab] : null;
  
  if (!explainer || !visibleTab) return null;

  const Icon = explainer.icon;

  return (
    <AnimatePresence mode="wait">
      {visibleTab && (
        <motion.div
          key={visibleTab}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={isExiting 
            ? { opacity: 0, x: 100, height: 0, marginBottom: 0 }
            : { opacity: 1, y: 0, height: 'auto', marginBottom: 16 }
          }
          exit={{ opacity: 0, x: 100, height: 0, marginBottom: 0 }}
          transition={isExiting 
            ? { duration: 0.25, ease: 'easeIn' }
            : { duration: 0.4, ease: 'easeOut' }
          }
          className="overflow-hidden"
        >
          <div className={`p-4 rounded-lg border ${explainer.bgClass}`}>
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5 text-foreground/70 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{explainer.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {explainer.description}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
