/**
 * PulseItem - Individual Pulse Bar Item Component
 *
 * Displays a single C item with animated indicator, activity dots, micro-text,
 * and hover preview card. Features living pulse animations and click feedback.
 */

import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PulseSection, PulseConfig, PulseStatus, PulseKey } from '@/types/pulse';
import { PulsePreviewCard } from './PulsePreviewCard';
import {
  Sankofa,
  Nkonsonkonson,
  FuntunfunefuDenkyemfunefu,
  Adinkrahene,
  Mpatapo,
} from '@/components/icons/adinkra';

const ICONS: Record<string, LucideIcon> = {
  Sankofa,
  Nkonsonkonson,
  FuntunfunefuDenkyemfunefu,
  Adinkrahene,
  Mpatapo,
};

import { prefetchHubRoute } from '@/lib/prefetchHubRoutes';
const prefetchRoute = prefetchHubRoute;

interface PulseItemProps {
  config: PulseConfig;
  data?: PulseSection;
  pulseKey: PulseKey;
}

/**
 * Frame B — colour is the one C you are in.
 *
 * The active-route slot spends its C in exactly two places: the glyph+label as
 * one mark (via the parent's text colour, which both inherit) and a 2px rule
 * beneath as the second. No fill, no tint, no border. Inactive slots carry no
 * C. Full literal class strings so the JIT scanner can see them.
 */
const C_MARK: Record<PulseKey, string> = {
  connect: 'text-c5-connect',
  convene: 'text-c5-convene',
  collaborate: 'text-c5-collaborate',
  contribute: 'text-c5-contribute',
  convey: 'text-c5-convey',
};

const C_RULE: Record<PulseKey, string> = {
  connect: 'bg-c5-connect',
  convene: 'bg-c5-convene',
  collaborate: 'bg-c5-collaborate',
  contribute: 'bg-c5-contribute',
  convey: 'bg-c5-convey',
};

/**
 * Status is shape, not hue: filled dot = active, hollow ring = attention,
 * numeral = count, crimson dot = urgent (the one colour exception). No C hue
 * ever rides on the status mark.
 */
const STATUS_DOT: Record<PulseStatus, string> = {
  active: 'bg-foreground',
  attention: 'border border-foreground',
  dormant: '',
  urgent: 'bg-dna-crimson',
};

export function PulseItem({ config, data, pulseKey }: PulseItemProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const Icon = ICONS[config.icon] || Sankofa;
  const status: PulseStatus = data?.status || 'dormant';
  const count = data?.count || 0;
  const microText = data?.micro_text || '';
  const hasItems = data?.top_items && data.top_items.length > 0;

  // Colour is keyed on the active ROUTE, never on pulse activity: only the C
  // you are in is coloured, and it changes only when the route changes.
  const location = useLocation();
  const path = location.pathname;
  const href = config.href;
  const isActiveRoute =
    path.startsWith(href) ||
    (href === '/dna/connect' &&
      (path.startsWith('/dna/profile') ||
        path.startsWith('/dna/discover') ||
        path.startsWith('/dna/network'))) ||
    (href === '/dna/collaborate' && path.startsWith('/dna/spaces'));

  // Status ping/dot colour: neutral by default, crimson only for urgent.
  const dotColor = status === 'urgent' ? 'bg-dna-crimson' : 'bg-foreground';

  // Calculate activity dots (1-5 based on count)
  const activityLevel = Math.min(Math.max(count, 0), 5);

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setShowPreview(true);
    prefetchRoute(config.href);
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
      onTouchStart={() => prefetchRoute(config.href)}
      onFocus={() => prefetchRoute(config.href)}
    >
      <motion.div
        transition={{ duration: 0.12 }}
      >
        <Link
          to={config.href}
          className={cn(
            'flex flex-col items-center p-2.5 rounded-xl transition-all duration-200',
            isActiveRoute ? C_MARK[pulseKey] : 'text-muted-foreground',
          )}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
        >
          {/* Icon + Label Row */}
          <div className="flex items-center gap-1.5">
            {/* Status indicator — shape carries status, colour stays neutral
                (crimson is the one exception, for urgent). The ping timings are
                unchanged; only the hue moved off the C. */}
            <span className="relative flex h-2 w-2">
              {(status === 'active' || status === 'urgent') && (
                <motion.span
                  className={cn(
                    'absolute inset-0 rounded-full opacity-40',
                    dotColor,
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
              {status === 'attention' && (
                <motion.span
                  className={cn(
                    'absolute inset-0 rounded-full opacity-30',
                    dotColor,
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
              {status !== 'dormant' && (
                <span
                  className={cn(
                    'relative inline-flex rounded-full h-2 w-2',
                    STATUS_DOT[status],
                  )}
                />
              )}
            </span>

            <Icon className="w-[18px] h-[18px]" />

            <span className="text-xs font-semibold tracking-wide hidden sm:inline">
              {config.label}
            </span>

            {/* Count badge when active */}
            {count > 0 && (
              <span className={cn(
                'text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none',
                'bg-current/10',
              )}>
                {count}
              </span>
            )}
          </div>

          {/* Micro-text */}
          <span className="text-[11px] text-center truncate max-w-full px-1 opacity-70 mt-0.5">
            {microText}
          </span>

          {/* Second place the active C is spent: a 2px rule beneath the mark. */}
          {isActiveRoute && (
            <span className={cn('h-0.5 w-6 rounded-full mt-1', C_RULE[pulseKey])} />
          )}
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
