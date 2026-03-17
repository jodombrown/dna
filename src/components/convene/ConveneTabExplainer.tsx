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
import { CalendarDays, MapPin, Clock, Globe, Ticket, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export type ConveneTab = 'all' | 'near_me' | 'this_week' | 'online' | 'free' | 'network';

interface ConveneTabExplainerProps {
  activeTab: string;
}

const TAB_EXPLAINERS: Record<ConveneTab, { title: string; description: string; icon: React.ElementType; bgClass: string }> = {
  all: {
    title: 'All Events',
    description: 'Browse every upcoming event across the diaspora community',
    icon: CalendarDays,
    bgClass: 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20',
  },
  near_me: {
    title: 'Near Me',
    description: 'Events happening close to your current location',
    icon: MapPin,
    bgClass: 'bg-gradient-to-r from-dna-emerald/10 to-dna-emerald/5 border-dna-emerald/20',
  },
  this_week: {
    title: 'This Week',
    description: 'Events taking place within the next seven days',
    icon: Clock,
    bgClass: 'bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 border-dna-copper/20',
  },
  online: {
    title: 'Online',
    description: 'Virtual events you can join from anywhere in the world',
    icon: Globe,
    bgClass: 'bg-gradient-to-r from-dna-terracotta/10 to-dna-terracotta/5 border-dna-terracotta/20',
  },
  free: {
    title: 'Free Events',
    description: 'No-cost events open to all community members',
    icon: Ticket,
    bgClass: 'bg-gradient-to-r from-dna-ochre/10 to-dna-ochre/5 border-dna-ochre/20',
  },
  network: {
    title: 'My Network',
    description: 'Events hosted by or attended by people in your network',
    icon: Users,
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

  const explainer = visibleTab ? TAB_EXPLAINERS[visibleTab] : null;
  
  if (!explainer || !visibleTab) return null;

  const Icon = explainer.icon;

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
          <div className={`p-3 rounded-lg border ${explainer.bgClass}`}>
            <div className="flex items-start gap-2">
              <Icon className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-xs">{explainer.title}</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
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
