/**
 * PulseItem - Individual Pulse Bar Item Component
 *
 * Displays a single C item with indicator, activity dots, micro-text,
 * and hover preview card.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

const STATUS_STYLES: Record<PulseStatus, string> = {
  active: 'text-dna-emerald bg-dna-emerald/10 hover:bg-dna-emerald/15',
  attention: 'text-dna-copper bg-dna-copper/10 hover:bg-dna-copper/15',
  dormant: 'text-gray-400 bg-gray-50 hover:bg-gray-100',
  urgent: 'text-dna-copper bg-dna-copper/10 hover:bg-dna-copper/15 animate-pulse',
};

const INDICATOR_STYLES: Record<PulseStatus, string> = {
  active: 'bg-dna-emerald',
  attention: 'bg-dna-copper',
  dormant: 'bg-gray-300',
  urgent: 'bg-dna-copper animate-ping',
};

export function PulseItem({ config, data, pulseKey }: PulseItemProps) {
  const [showPreview, setShowPreview] = useState(false);
  const hideTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const Icon = ICONS[config.icon] || Users;
  const status: PulseStatus = data?.status || 'dormant';
  const count = data?.count || 0;
  const microText = data?.micro_text || '';
  const hasItems = data?.top_items && data.top_items.length > 0;

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
    // Delay hiding to allow mouse to move to preview card
    hideTimeoutRef.current = setTimeout(() => {
      setShowPreview(false);
    }, 150);
  };

  // Cleanup timeout on unmount
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
      <Link
        to={config.href}
        className={cn(
          'flex flex-col items-center p-2 rounded-lg transition-all duration-200',
          'hover:shadow-md hover:-translate-y-0.5',
          STATUS_STYLES[status]
        )}
      >
        {/* Indicator + Icon + Label Row */}
        <div className="flex items-center gap-1.5 mb-1">
          {/* Status Indicator */}
          <span className="relative flex h-2 w-2">
            {status === 'urgent' && (
              <span
                className={cn(
                  'absolute inline-flex h-full w-full rounded-full opacity-75',
                  INDICATOR_STYLES[status]
                )}
              />
            )}
            <span
              className={cn(
                'relative inline-flex rounded-full h-2 w-2',
                INDICATOR_STYLES[status]
              )}
            />
          </span>

          {/* Icon */}
          <Icon className="w-4 h-4" />

          {/* Label - hidden on very small screens */}
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            {config.label}
          </span>
        </div>

        {/* Activity Dots */}
        <div className="flex gap-0.5 mb-1">
          {[1, 2, 3, 4, 5].map((dot) => (
            <span
              key={dot}
              className={cn(
                'w-1 h-1 rounded-full transition-all duration-300',
                dot <= activityLevel
                  ? INDICATOR_STYLES[status]
                  : 'bg-gray-200'
              )}
            />
          ))}
        </div>

        {/* Micro-text */}
        <span className="text-xs text-center truncate max-w-full px-1">
          {microText}
        </span>
      </Link>

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
