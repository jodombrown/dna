/**
 * DNA | FEED v2 - DIA Insight Card
 *
 * Renders DIA intelligence insights with gradient border,
 * data points, and action CTAs.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { X, Sparkles, TrendingUp, Users, Lightbulb } from 'lucide-react';
import type { FeedItem, DIAInsightFeedContent, DIADataPoint } from '@/types/feedTypes';

interface DIAInsightCardProps {
  item: FeedItem;
  onAction?: (action: DIAInsightFeedContent['actionCTA']) => void;
  onDismiss?: (feedItemId: string) => void;
}

const INSIGHT_ICONS: Record<string, React.FC<{ className?: string }>> = {
  network_insight: Users,
  opportunity_match: TrendingUp,
  event_recommendation: Sparkles,
  trending_topic: TrendingUp,
  default: Lightbulb,
};

export const DIAInsightCard: React.FC<DIAInsightCardProps> = ({
  item,
  onAction,
  onDismiss,
}) => {
  const content = item.content as DIAInsightFeedContent;
  const InsightIcon = INSIGHT_ICONS[content.insightType] || INSIGHT_ICONS.default;

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'bg-gradient-to-br from-dna-gold/5 via-transparent to-dna-emerald/5',
        'rounded-none md:rounded-xl',
        'border-b border-border/30 md:border md:border-border/50',
        'px-4 py-4 md:p-5'
      )}
      style={{
        backgroundImage:
          'linear-gradient(135deg, rgba(196, 148, 42, 0.03) 0%, transparent 50%, rgba(74, 141, 119, 0.03) 100%)',
      }}
    >
      {/* Gradient top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: 'linear-gradient(90deg, #C4942A 0%, #4A8D77 50%, #2A7A8C 100%)',
        }}
      />

      {/* Dismiss button */}
      {onDismiss && (
        <button
          onClick={() => onDismiss(item.id)}
          className="absolute top-3 right-3 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss insight"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* DIA header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-dna-gold to-dna-emerald flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-dna-gold">
          DIA Insight
        </span>
      </div>

      {/* Headline */}
      <h3 className="text-sm font-semibold leading-tight mb-2">{content.headline}</h3>

      {/* Body */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{content.body}</p>

      {/* Data points */}
      {content.dataPoints.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-3">
          {content.dataPoints.map((dp: DIADataPoint, idx: number) => (
            <div
              key={idx}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-background/80 rounded-md border border-border/30"
            >
              <InsightIcon className="w-3.5 h-3.5 text-dna-gold" />
              <div>
                <span className="text-xs text-muted-foreground">{dp.label}</span>
                <span className="text-sm font-semibold ml-1">{dp.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action CTAs */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          className="h-8 text-xs bg-dna-gold hover:bg-dna-gold/90"
          onClick={() => onAction?.(content.actionCTA)}
        >
          {content.actionCTA.label}
        </Button>
        {content.secondaryCTA && (
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => onAction?.(content.secondaryCTA!)}
          >
            {content.secondaryCTA.label}
          </Button>
        )}
      </div>
    </div>
  );
};
