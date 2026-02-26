/**
 * PulseItem - Individual Pulse Bar Item Component
 *
 * Displays a single C item with animated indicator, activity dots, micro-text,
 * and hover preview card. Features living pulse animations and click feedback.
 */

import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Layers,
  Gift,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PulseSection, PulseConfig, PulseStatus } from '@/types/pulse';
import { PulsePreviewCard } from './PulsePreviewCard';

const ICONS: Record<string, LucideIcon> = {
  Users,
  Calendar,
  Layers,
  Gift,
  Megaphone,
};

interface PulseItemProps {
  config: PulseConfig;
  data?: PulseSection;
  pulseKey: string;
}

const STATUS_COLORS: Record<PulseStatus, { bg: string; glow: string; text: string; indicator: string }> = {
  active: {
    bg: 'bg-primary/8 hover:bg-primary/14',
    glow: 'shadow-[0_0_12px_-2px_hsl(var(--primary)/0.3)]',
    text: 'text-primary',
    indicator: 'bg-primary',
  },
  attention: {
    bg: 'bg-amber-500/8 hover:bg-amber-500/14',
    glow: 'shadow-[0_0_12px_-2px_hsl(36,90%,50%,0.3)]',
    text: 'text-amber-600',
    indicator: 'bg-amber-500',
  },
  dormant: {
    bg: 'bg-muted/40 hover:bg-muted/60',
    glow: '',
    text: 'text-muted-foreground',
    indicator: 'bg-muted-foreground/30',
  },
  urgent: {
    bg: 'bg-destructive/8 hover:bg-destructive/14',
    glow: 'shadow-[0_0_16px_-2px_hsl(var(--destructive)/0.4)]',
    text: 'text-destructive',
    indicator: 'bg-destructive',
  },
};

export function PulseItem({ config, data, pulseKey }: PulseItemProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const Icon = ICONS[config.icon] || Users;
  const status: PulseStatus = data?.status || 'dormant';
  const count = data?.count || 0;
  const microText = data?.micro_text || '';
  const hasItems = data?.top_items && data.top_items.length > 0;
  const colors = STATUS_COLORS[status];

  // Calculate activity dots (1-5 based on count)
  const activityLevel = Math.min(Math.max(count, 0), 5);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative flex-1 min-w-0"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Link
          to={config.href}
          className={cn(
            'flex flex-col items-center p-2.5 rounded-xl transition-all duration-200',
            'border border-transparent',
            colors.bg,
            colors.text,
            status !== 'dormant' && colors.glow,
            status !== 'dormant' && 'border-current/10',
          )}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
        >
          {/* Indicator + Icon + Label Row */}
          <div className="flex items-center gap-1.5 mb-1">
            {/* Animated Status Indicator */}
            <span className="relative flex h-2.5 w-2.5">
              {/* Breathing ring for active/urgent */}
              {(status === 'active' || status === 'urgent') && (
                <motion.span
                  className={cn(
                    'absolute inset-0 rounded-full opacity-40',
                    colors.indicator,
                  )}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 0, 0.4],
                  }}
                  transition={{
                    duration: status === 'urgent' ? 1.2 : 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              {/* Attention slow pulse */}
              {status === 'attention' && (
                <motion.span
                  className={cn(
                    'absolute inset-0 rounded-full opacity-30',
                    colors.indicator,
                  )}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
              <span
                className={cn(
                  'relative inline-flex rounded-full h-2.5 w-2.5',
                  colors.indicator,
                )}
              />
            </span>

            {/* Icon with subtle bounce on active */}
            <motion.div
              animate={status === 'active' ? { 
                y: [0, -1, 0],
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Icon className="w-4 h-4" />
            </motion.div>

            {/* Label */}
            <span className="text-xs font-semibold tracking-wide hidden sm:inline">
              {config.label}
            </span>
          </div>

          {/* Activity Dots with staggered animation */}
          <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map((dot) => (
              <motion.span
                key={dot}
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  dot <= activityLevel ? colors.indicator : 'bg-muted-foreground/15',
                )}
                initial={false}
                animate={
                  dot <= activityLevel && status !== 'dormant'
                    ? {
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 1, 0.7],
                      }
                    : { scale: 1, opacity: 1 }
                }
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: dot * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>

          {/* Micro-text */}
          <span className="text-[11px] text-center truncate max-w-full px-1 opacity-80">
            {microText}
          </span>
        </Link>
      </motion.div>

      {/* Hover Preview Card */}
      {showPreview && hasItems && (
        <PulsePreviewCard
          label={config.label}
          items={data!.top_items}
          href={config.href}
        />
      )}
    </div>
  );
}

export default PulseItem;
