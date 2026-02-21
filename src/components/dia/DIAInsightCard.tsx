/**
 * DNA | DIA Insight Card Component
 *
 * Renders a DIA intelligence card with module accent color,
 * category label, actions, and dismiss functionality.
 *
 * Visually distinct from user-generated content — features
 * DIA branding, left accent border, and module header.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  X,
  Sparkles,
  UserPlus,
  TrendingUp,
  RefreshCw,
  GitBranch,
  Users,
  Calendar,
  MessageCircle,
  Mic,
  AlertCircle,
  Wrench,
  Trophy,
  Clock,
  Target,
  Activity,
  Heart,
  Handshake,
  BarChart3,
  Share2,
  PenLine,
  ArrowRightLeft,
  LayoutGrid,
  Lightbulb,
} from 'lucide-react';
import type { DIACard, DIACardAction, DIACardCategory } from '@/services/diaCardService';

// ── Icon Registry ──────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  UserPlus,
  TrendingUp,
  RefreshCw,
  GitBranch,
  Users,
  Calendar,
  MessageCircle,
  Mic,
  AlertCircle,
  Wrench,
  Trophy,
  Clock,
  Target,
  Activity,
  Heart,
  Handshake,
  BarChart3,
  Share2,
  PenLine,
  ArrowRightLeft,
  LayoutGrid,
  Lightbulb,
  Sparkles,
};

// ── Category Display Names ─────────────────────────

const CATEGORY_LABELS: Record<DIACardCategory, string> = {
  connect: 'CONNECT',
  convene: 'CONVENE',
  collaborate: 'COLLABORATE',
  contribute: 'CONTRIBUTE',
  convey: 'CONVEY',
  cross_c: 'CROSS-C',
};

// ── Component ──────────────────────────────────────

interface DIAInsightCardProps {
  card: DIACard;
  onAction: (action: DIACardAction) => void;
  onDismiss: (dismissKey: string) => void;
  compact?: boolean;
}

export function DIAInsightCard({
  card,
  onAction,
  onDismiss,
  compact = false,
}: DIAInsightCardProps) {
  const navigate = useNavigate();
  const CardIcon = ICON_MAP[card.icon] || Lightbulb;

  const handleAction = (action: DIACardAction) => {
    if (action.type === 'dismiss') {
      onDismiss(card.dismissKey);
      return;
    }
    if (action.type === 'navigate' && action.payload.url) {
      navigate(action.payload.url as string);
    }
    onAction(action);
  };

  const primaryAction = card.actions.find(a => a.isPrimary);
  const secondaryActions = card.actions.filter(a => !a.isPrimary);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 bg-card',
        compact ? 'px-3 py-3' : 'px-4 py-4',
      )}
      style={{
        borderLeftWidth: '3px',
        borderLeftColor: card.accentColor,
        backgroundColor: `${card.accentColor}08`,
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(card.dismissKey)}
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header: DIA icon + module label */}
      <div className="flex items-center gap-2 mb-2 pr-6">
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full"
          style={{ backgroundColor: `${card.accentColor}20` }}
        >
          <Sparkles className="w-3 h-3" style={{ color: card.accentColor }} />
        </div>
        <span
          className="text-[10px] font-bold tracking-widest"
          style={{ color: card.accentColor }}
        >
          DIA &bull; {CATEGORY_LABELS[card.category]}
        </span>
      </div>

      {/* Icon + Headline */}
      <div className="flex items-start gap-2 mb-1.5">
        <CardIcon
          className={cn('w-4 h-4 mt-0.5 shrink-0')}
          style={{ color: card.accentColor }}
        />
        <h4 className={cn('font-semibold text-foreground leading-tight', compact ? 'text-xs' : 'text-sm')}>
          {card.headline}
        </h4>
      </div>

      {/* Body */}
      <p className={cn('text-muted-foreground leading-relaxed ml-6', compact ? 'text-xs' : 'text-sm')}>
        {card.body}
      </p>

      {/* Actions */}
      {!compact && (primaryAction || secondaryActions.length > 0) && (
        <div className="flex items-center gap-2 mt-3 ml-6">
          {primaryAction && (
            <Button
              size="sm"
              className="h-7 text-xs"
              style={{ backgroundColor: card.accentColor }}
              onClick={() => handleAction(primaryAction)}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryActions.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => handleAction(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Compact mode: single action */}
      {compact && primaryAction && (
        <button
          onClick={() => handleAction(primaryAction)}
          className="mt-2 ml-6 text-xs font-medium transition-colors"
          style={{ color: card.accentColor }}
        >
          {primaryAction.label} &rarr;
        </button>
      )}
    </div>
  );
}

export default DIAInsightCard;
